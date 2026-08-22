import { describe, expect, it } from "vitest";
import { getRobotsDisallowPaths, ROBOTS_PRIVATE_PREFIXES } from "@/lib/robots-rules";

describe("getRobotsDisallowPaths", () => {
  it("always blocks api and uploads", () => {
    const paths = getRobotsDisallowPaths(["hu", "en"]);
    expect(paths).toContain("/api/");
    expect(paths).toContain("/uploads/");
  });

  it("prefixes every private surface for each locale", () => {
    const paths = getRobotsDisallowPaths(["hu", "en"]);
    for (const locale of ["hu", "en"]) {
      for (const prefix of ROBOTS_PRIVATE_PREFIXES) {
        expect(paths).toContain(`/${locale}${prefix}`);
      }
    }
    expect(paths).toContain("/hu/admin");
    expect(paths).toContain("/en/forgot-password");
    expect(paths).toContain("/hu/booking");
  });
});
