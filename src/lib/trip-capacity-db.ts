import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import {
  buildCapacitySnapshot,
  countOccupiedSeatsFromRecords,
  TripCapacityFullError,
  type SeatHolder,
  type TripCapacitySnapshot,
} from "@/lib/trip-capacity";

type CapacityDb = {
  trip: {
    findUnique: Prisma.TransactionClient["trip"]["findUnique"];
  };
  booking: {
    findMany: Prisma.TransactionClient["booking"]["findMany"];
  };
  tripApplication: {
    findMany: Prisma.TransactionClient["tripApplication"]["findMany"];
  };
};

async function loadOccupiedRecords(db: CapacityDb, tripIds: string[]) {
  const [bookings, applications] = await Promise.all([
    db.booking.findMany({
      where: { tripId: { in: tripIds }, status: { in: ["pending", "paid"] } },
      select: { tripId: true, customerEmail: true, userId: true },
    }),
    db.tripApplication.findMany({
      where: { tripId: { in: tripIds } },
      select: { tripId: true, email: true, userId: true },
    }),
  ]);

  return { bookings, applications };
}

function toSeatHolder(row: {
  customerEmail?: string | null;
  email?: string | null;
  userId: string | null;
}): SeatHolder {
  return { email: row.customerEmail ?? row.email ?? null, userId: row.userId };
}

export async function getOccupiedSeatsByTripIds(
  tripIds: string[],
  db: CapacityDb = prisma
): Promise<Map<string, number>> {
  const occupancy = new Map<string, number>();
  for (const tripId of tripIds) occupancy.set(tripId, 0);
  if (tripIds.length === 0) return occupancy;

  const { bookings, applications } = await loadOccupiedRecords(db, tripIds);

  for (const tripId of tripIds) {
    occupancy.set(
      tripId,
      countOccupiedSeatsFromRecords({
        bookings: bookings
          .filter((row) => row.tripId === tripId)
          .map(toSeatHolder),
        applications: applications
          .filter((row) => row.tripId === tripId)
          .map(toSeatHolder),
      })
    );
  }

  return occupancy;
}

export async function getTripCapacitySnapshot(
  tripId: string,
  db: CapacityDb = prisma
): Promise<TripCapacitySnapshot | null> {
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    select: { id: true, maxCapacity: true, overbookLimit: true },
  });
  if (!trip) return null;

  const occupancy = await getOccupiedSeatsByTripIds([tripId], db);
  return buildCapacitySnapshot(
    trip.id,
    trip.maxCapacity,
    trip.overbookLimit,
    occupancy.get(trip.id) ?? 0
  );
}

export async function lockTripForUpdate(
  tx: Prisma.TransactionClient,
  tripId: string
) {
  await tx.$queryRaw`SELECT "id" FROM "trip" WHERE "id" = ${tripId} FOR UPDATE`;
}

export async function assertTripHasCapacity(
  tx: Prisma.TransactionClient,
  tripId: string
): Promise<TripCapacitySnapshot> {
  await lockTripForUpdate(tx, tripId);
  const snapshot = await getTripCapacitySnapshot(tripId, tx);
  if (!snapshot || snapshot.isFull) {
    throw new TripCapacityFullError();
  }
  return snapshot;
}
