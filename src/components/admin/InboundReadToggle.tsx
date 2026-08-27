"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { setBookingRead } from "@/app/actions/admin/bookings";
import {
  setContactMessageRead,
  setTripApplicationRead,
} from "@/app/actions/admin/inbound";

type Props = {
  kind: "contact" | "application" | "booking";
  id: string;
  read: boolean;
};

export function InboundReadToggle({ kind, id, read }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant={read ? "ghost" : "outline"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (kind === "contact") {
            await setContactMessageRead(id, !read);
          } else if (kind === "application") {
            await setTripApplicationRead(id, !read);
          } else {
            await setBookingRead(id, !read);
          }
          router.refresh();
        })
      }
    >
      {read ? t("markUnread") : t("markRead")}
    </Button>
  );
}
