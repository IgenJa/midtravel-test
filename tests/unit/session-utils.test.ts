import { describe, expect, it } from "vitest";
import { getUserDisplayName, isAdminRole } from "@/lib/session-utils";

describe("isAdminRole", () => {
  it("treats a comma-separated role list as admin when it contains admin", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("user,admin")).toBe(true);
    expect(isAdminRole(" admin ")).toBe(true);
    expect(isAdminRole("user")).toBe(false);
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole("")).toBe(false);
  });
});

describe("getUserDisplayName", () => {
  it("returns the first name token", () => {
    expect(getUserDisplayName("Anna Kovács")).toBe("Anna");
    expect(getUserDisplayName("  Béla  ")).toBe("Béla");
  });
});
