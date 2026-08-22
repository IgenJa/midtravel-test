import type { EmailSendStatus } from "@/generated/prisma";

export const failedEmailWhere = {
  OR: [
    { guestEmailStatus: "failed" as const },
    { officeEmailStatus: "failed" as const },
  ],
};

export function hasFailedEmail(record: {
  guestEmailStatus: EmailSendStatus;
  officeEmailStatus: EmailSendStatus;
}) {
  return (
    record.guestEmailStatus === "failed" ||
    record.officeEmailStatus === "failed"
  );
}
