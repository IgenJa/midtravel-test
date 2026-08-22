export const DEFAULT_MAX_CAPACITY = 16;
export const DEFAULT_OVERBOOK_LIMIT = 0;
export const MAX_CAPACITY_MAX = 200;
export const OVERBOOK_LIMIT_MAX = 100;

export class TripCapacityFullError extends Error {
  constructor() {
    super("TRIP_FULL");
    this.name = "TripCapacityFullError";
  }
}

export type SeatHolder = {
  email?: string | null;
  userId?: string | null;
};

export type TripCapacitySnapshot = {
  tripId: string;
  maxCapacity: number;
  overbookLimit: number;
  allowedSeats: number;
  occupiedSeats: number;
  remainingSeats: number;
  isFull: boolean;
  isOverbooked: boolean;
};

function occupantKeys(holder: SeatHolder): string[] {
  const keys: string[] = [];
  const email = holder.email?.trim().toLowerCase();
  if (email) keys.push(`email:${email}`);
  if (holder.userId) keys.push(`user:${holder.userId}`);
  return keys;
}

export function allowedSeats(
  maxCapacity: number,
  overbookLimit: number
): number {
  return Math.max(0, maxCapacity) + Math.max(0, overbookLimit);
}

export function buildCapacitySnapshot(
  tripId: string,
  maxCapacity: number,
  overbookLimit: number,
  occupiedSeats: number
): TripCapacitySnapshot {
  const allowed = allowedSeats(maxCapacity, overbookLimit);
  return {
    tripId,
    maxCapacity,
    overbookLimit,
    allowedSeats: allowed,
    occupiedSeats,
    remainingSeats: Math.max(0, allowed - occupiedSeats),
    isFull: occupiedSeats >= allowed,
    isOverbooked: occupiedSeats > maxCapacity,
  };
}

/**
 * Each pending/paid booking occupies 1 seat. Each application occupies 1 seat
 * unless the same email or user already holds a pending/paid booking
 * (checkout creates both records).
 */
export function countOccupiedSeatsFromRecords(input: {
  bookings: SeatHolder[];
  applications: SeatHolder[];
}): number {
  const covered = new Set<string>();

  for (const booking of input.bookings) {
    for (const key of occupantKeys(booking)) {
      covered.add(key);
    }
  }

  let extraApplications = 0;
  for (const application of input.applications) {
    const keys = occupantKeys(application);
    if (keys.some((key) => covered.has(key))) continue;
    extraApplications += 1;
  }

  return input.bookings.length + extraApplications;
}

export function parseCapacityField(
  value: unknown,
  { min, max }: { min: number; max: number }
): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) return null;
  if (parsed < min || parsed > max) return null;
  return parsed;
}

export function isTripCapacityFullError(
  error: unknown
): error is TripCapacityFullError {
  return error instanceof TripCapacityFullError;
}
