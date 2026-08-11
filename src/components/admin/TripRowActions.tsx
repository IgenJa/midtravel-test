"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { deleteTrip, setTripPublished } from "@/app/actions/admin/trips";

type Props = {
  id: string;
  published: boolean;
};

export function TripRowActions({ id, published }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button href={`/admin/trips/${id}`} size="sm" variant="outline">
        {t("edit")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await setTripPublished(id, !published);
            router.refresh();
          })
        }
      >
        {published ? t("unpublish") : t("publish")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            if (!window.confirm(t("confirmDelete"))) return;
            await deleteTrip(id);
            router.refresh();
          })
        }
      >
        {t("delete")}
      </Button>
    </div>
  );
}
