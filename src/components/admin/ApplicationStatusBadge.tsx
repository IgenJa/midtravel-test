import { cn } from "@/lib/utils";

type ApplicationStatus = "open" | "converted" | "released";

type Props = {
  status: ApplicationStatus;
  labels: Record<ApplicationStatus, string>;
};

const tone: Record<ApplicationStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  converted: "bg-teal-100 text-teal-800",
  released: "bg-slate-100 text-slate-600",
};

export function ApplicationStatusBadge({ status, labels }: Props) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        tone[status]
      )}
    >
      {labels[status]}
    </span>
  );
}
