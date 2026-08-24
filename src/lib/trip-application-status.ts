import type { TripApplicationStatus } from "@/generated/prisma";

export const SEAT_HOLDING_APPLICATION_STATUS = "open" satisfies TripApplicationStatus;

export function applicationOccupiesSeat(
  status: TripApplicationStatus | string
): boolean {
  return status === SEAT_HOLDING_APPLICATION_STATUS;
}
