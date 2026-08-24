import { describe, expect, it } from "vitest";
import { applicationOccupiesSeat } from "@/lib/trip-application-status";

describe("applicationOccupiesSeat", () => {
  it("only open applications hold a seat", () => {
    expect(applicationOccupiesSeat("open")).toBe(true);
    expect(applicationOccupiesSeat("converted")).toBe(false);
    expect(applicationOccupiesSeat("released")).toBe(false);
  });
});
