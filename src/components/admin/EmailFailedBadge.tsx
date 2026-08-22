import type { EmailSendStatus } from "@/generated/prisma";
import { hasFailedEmail } from "@/lib/email-delivery";
import { cn } from "@/lib/utils";

type Props = {
  guestEmailStatus: EmailSendStatus;
  officeEmailStatus: EmailSendStatus;
  label: string;
};

export function EmailFailedBadge({
  guestEmailStatus,
  officeEmailStatus,
  label,
}: Props) {
  if (!hasFailedEmail({ guestEmailStatus, officeEmailStatus })) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800"
      )}
    >
      {label}
    </span>
  );
}
