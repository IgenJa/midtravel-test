import { describe, expect, it } from "vitest";
import {
  allowedSeats,
  buildCapacitySnapshot,
  countOccupiedSeatsFromRecords,
  parseCapacityField,
} from "@/lib/trip-capacity";

describe("allowedSeats", () => {
  it("adds max capacity and overbook limit", () => {
    expect(allowedSeats(16, 2)).toBe(18);
    expect(allowedSeats(0, 0)).toBe(0);
    expect(allowedSeats(-1, -3)).toBe(0);
  });
});

describe("buildCapacitySnapshot", () => {
  it("marks full and overbooked independently", () => {
    const open = buildCapacitySnapshot("t1", 16, 2, 15);
    expect(open).toMatchObject({
      allowedSeats: 18,
      remainingSeats: 3,
      isFull: false,
      isOverbooked: false,
    });

    const overbooked = buildCapacitySnapshot("t1", 16, 2, 17);
    expect(overbooked.isFull).toBe(false);
    expect(overbooked.isOverbooked).toBe(true);
    expect(overbooked.remainingSeats).toBe(1);

    const full = buildCapacitySnapshot("t1", 16, 2, 18);
    expect(full.isFull).toBe(true);
    expect(full.remainingSeats).toBe(0);
  });
});

describe("countOccupiedSeatsFromRecords", () => {
  it("counts each pending/paid booking as one seat", () => {
    expect(
      countOccupiedSeatsFromRecords({
        bookings: [
          { email: "a@mid.hu", userId: "u1" },
          { email: "b@mid.hu", userId: "u2" },
        ],
        applications: [],
      })
    ).toBe(2);
  });

  it("counts an inquiry as one seat when there is no booking", () => {
    expect(
      countOccupiedSeatsFromRecords({
        bookings: [],
        applications: [{ email: "guest@mid.hu", userId: null }],
      })
    ).toBe(1);
  });

  it("does not double-count checkout (application + booking)", () => {
    expect(
      countOccupiedSeatsFromRecords({
        bookings: [{ email: "Ada@mid.hu", userId: "u1" }],
        applications: [{ email: "ada@mid.hu", userId: "u1" }],
      })
    ).toBe(1);
  });

  it("covers an earlier inquiry when the same email later books", () => {
    expect(
      countOccupiedSeatsFromRecords({
        bookings: [{ email: "same@mid.hu", userId: "u9" }],
        applications: [
          { email: "same@mid.hu", userId: null },
          { email: "same@mid.hu", userId: "u9" },
        ],
      })
    ).toBe(1);
  });

  it("matches a booking by userId when emails differ", () => {
    expect(
      countOccupiedSeatsFromRecords({
        bookings: [{ email: "paid@mid.hu", userId: "u3" }],
        applications: [{ email: "ask@mid.hu", userId: "u3" }],
      })
    ).toBe(1);
  });

  it("counts two inquiries from the same email as two seats", () => {
    expect(
      countOccupiedSeatsFromRecords({
        bookings: [],
        applications: [
          { email: "repeat@mid.hu", userId: null },
          { email: "repeat@mid.hu", userId: null },
        ],
      })
    ).toBe(2);
  });
});

describe("parseCapacityField", () => {
  it("accepts integers inside the range", () => {
    expect(parseCapacityField(16, { min: 1, max: 200 })).toBe(16);
    expect(parseCapacityField("0", { min: 0, max: 100 })).toBe(0);
  });

  it("rejects fractions, NaN and out-of-range values", () => {
    expect(parseCapacityField(1.5, { min: 1, max: 200 })).toBeNull();
    expect(parseCapacityField("nope", { min: 1, max: 200 })).toBeNull();
    expect(parseCapacityField(0, { min: 1, max: 200 })).toBeNull();
    expect(parseCapacityField(201, { min: 1, max: 200 })).toBeNull();
  });
});
