import { cn } from "@/lib/utils";

type Props = {
  read: boolean;
  readLabel: string;
  unreadLabel: string;
};

export function InboundStatusBadge({ read, readLabel, unreadLabel }: Props) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        read ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-800"
      )}
    >
      {read ? readLabel : unreadLabel}
    </span>
  );
}
