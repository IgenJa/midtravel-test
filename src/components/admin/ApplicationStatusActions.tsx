"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { setTripApplicationStatus } from "@/app/actions/admin/inbound";

type Props = {
  id: string;
  status: "open" | "converted" | "released";
  participants: number;
};

export function ApplicationStatusActions({ id, status, participants }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status === "converted") return null;

  const nextStatus = status === "open" ? "released" : "open";
  const confirmMessage =
    nextStatus === "released"
      ? t("confirmReleaseApplication", { count: participants })
      : t("confirmReopenApplication", { count: participants });

  function mapError(code: string) {
    if (code === "UNAUTHORIZED") return t("applicationStatusErrors.UNAUTHORIZED");
    if (code === "NOT_FOUND") return t("applicationStatusErrors.NOT_FOUND");
    if (code === "INVALID_STATUS") {
      return t("applicationStatusErrors.INVALID_STATUS");
    }
    if (code === "TRIP_FULL") return t("applicationStatusErrors.TRIP_FULL");
    return t("applicationStatusErrors.SAVE_FAILED");
  }

  return (
    <div>
      <Button
        type="button"
        size="sm"
        variant={nextStatus === "released" ? "outline" : "ghost"}
        disabled={pending}
        onClick={() => {
          if (!window.confirm(confirmMessage)) return;
          startTransition(async () => {
            setError(null);
            const result = await setTripApplicationStatus(id, nextStatus);
            if (!result.ok) {
              setError(mapError(result.code));
              return;
            }
            router.refresh();
          });
        }}
      >
        {pending
          ? t("applicationStatusSaving")
          : nextStatus === "released"
            ? t("releaseApplication")
            : t("reopenApplication")}
      </Button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
