"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import {
  resendApplicationEmails,
  resendContactEmails,
} from "@/app/actions/admin/inbound";
import { resendBookingNotifyEmails } from "@/app/actions/admin/bookings";

type Kind = "contact" | "application" | "booking";

type Props = {
  kind: Kind;
  id: string;
};

export function ResendNotifyEmailsButton({ kind, id }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function mapError(code: string) {
    if (code === "UNAUTHORIZED") return t("emailResendErrors.UNAUTHORIZED");
    if (code === "NOT_FOUND") return t("emailResendErrors.NOT_FOUND");
    if (code === "NOT_PAID") return t("emailResendErrors.NOT_PAID");
    return t("emailResendErrors.RESEND_FAILED");
  }

  return (
    <div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setMessage(null);
            setError(null);

            const result =
              kind === "contact"
                ? await resendContactEmails(id)
                : kind === "application"
                  ? await resendApplicationEmails(id)
                  : await resendBookingNotifyEmails(id);

            if (result.ok) {
              setMessage(t("emailResendSuccess"));
            } else {
              setError(mapError(result.code));
            }
            router.refresh();
          })
        }
      >
        {pending ? t("emailResending") : t("emailResend")}
      </Button>
      {message ? (
        <p className="mt-2 text-sm text-teal-800">{message}</p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
