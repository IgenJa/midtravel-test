"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { deleteTestimonial } from "@/app/actions/admin/testimonials";

type Props = { id: string };

export function TestimonialRowActions({ id }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button href={`/admin/testimonials/${id}`} size="sm" variant="outline">
        {t("edit")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            if (!window.confirm(t("confirmDelete"))) return;
            await deleteTestimonial(id);
            router.refresh();
          })
        }
      >
        {t("delete")}
      </Button>
    </div>
  );
}
