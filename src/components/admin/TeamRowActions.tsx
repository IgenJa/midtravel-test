"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { deleteTeamMember } from "@/app/actions/admin/team";

type Props = { id: string };

export function TeamRowActions({ id }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button href={`/admin/team/${id}`} size="sm" variant="outline">
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
            await deleteTeamMember(id);
            router.refresh();
          })
        }
      >
        {t("delete")}
      </Button>
    </div>
  );
}
