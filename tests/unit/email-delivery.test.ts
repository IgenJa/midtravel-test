import { describe, expect, it } from "vitest";
import { failedEmailWhere, hasFailedEmail } from "@/lib/email-delivery";
import { emailStatusFromOk } from "@/lib/email";

describe("hasFailedEmail", () => {
  it("is true when guest or office send failed", () => {
    expect(
      hasFailedEmail({ guestEmailStatus: "failed", officeEmailStatus: "sent" })
    ).toBe(true);
    expect(
      hasFailedEmail({ guestEmailStatus: "sent", officeEmailStatus: "failed" })
    ).toBe(true);
    expect(
      hasFailedEmail({ guestEmailStatus: "sent", officeEmailStatus: "sent" })
    ).toBe(false);
    expect(
      hasFailedEmail({
        guestEmailStatus: "pending",
        officeEmailStatus: "pending",
      })
    ).toBe(false);
  });
});

describe("failedEmailWhere", () => {
  it("matches either guest or office failure", () => {
    expect(failedEmailWhere.OR).toEqual([
      { guestEmailStatus: "failed" },
      { officeEmailStatus: "failed" },
    ]);
  });
});

describe("emailStatusFromOk", () => {
  it("maps send result to the stored status", () => {
    expect(emailStatusFromOk(true)).toBe("sent");
    expect(emailStatusFromOk(false)).toBe("failed");
  });
});
