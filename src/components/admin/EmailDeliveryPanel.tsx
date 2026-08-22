import type { EmailSendStatus } from "@/generated/prisma";
import { hasFailedEmail } from "@/lib/email-delivery";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Labels = {
  guest: string;
  office: string;
  pending: string;
  sent: string;
  failed: string;
  warning: string;
};

type Props = {
  guestEmailStatus: EmailSendStatus;
  officeEmailStatus: EmailSendStatus;
  labels: Labels;
  children?: ReactNode;
};

function statusClass(status: EmailSendStatus) {
  if (status === "failed") return "font-semibold text-red-700";
  if (status === "sent") return "text-teal-800";
  return "text-slate-700";
}

export function EmailDeliveryPanel({
  guestEmailStatus,
  officeEmailStatus,
  labels,
  children,
}: Props) {
  const failed = hasFailedEmail({
    guestEmailStatus,
    officeEmailStatus,
  });

  return (
    <section
      className={cn(
        "mt-6 rounded-2xl border p-6",
        failed
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white"
      )}
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {labels.guest}
          </dt>
          <dd className={cn("mt-1", statusClass(guestEmailStatus))}>
            {labels[guestEmailStatus]}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {labels.office}
          </dt>
          <dd className={cn("mt-1", statusClass(officeEmailStatus))}>
            {labels[officeEmailStatus]}
          </dd>
        </div>
      </dl>
      {failed ? (
        <p className="mt-4 text-sm text-red-800">{labels.warning}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
