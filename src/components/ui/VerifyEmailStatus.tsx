"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { authClient } from "@/lib/auth-client";
import type { Locale } from "@/i18n/routing";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

export function VerifyEmailStatus({ errorCode }: { errorCode?: string }) {
  const t = useTranslations("verifyEmail");
  const locale = useLocale() as Locale;
  const { user, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const hasError = Boolean(errorCode);

  const handleResend = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || resendState === "sending") return;
    setResendState("sending");
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: trimmed,
        callbackURL: `/${locale}/verify-email`,
      });
      setResendState(error ? "error" : "sent");
    } catch {
      setResendState("error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{t("invalidLink")}</p>
        </div>
        <div>
          <label htmlFor="verify-email" className="mb-2 block text-sm font-medium text-slate-700">
            {t("email")}
          </label>
          <input
            id="verify-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (resendState !== "idle") setResendState("idle");
            }}
            className={inputClasses}
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
          />
        </div>
        <Button
          type="button"
          size="lg"
          disabled={!email.trim() || resendState === "sending" || resendState === "sent"}
          onClick={handleResend}
          className="w-full"
        >
          <Mail className="h-4 w-4" />
          {resendState === "sending"
            ? t("resendSending")
            : resendState === "sent"
              ? t("resendSent")
              : t("resend")}
        </Button>
        {resendState === "error" && (
          <p className="text-sm text-red-600">{t("errors.resendFailed")}</p>
        )}
        <p className="text-center text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-teal-600 hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl bg-teal-50 p-4 text-teal-800">
        <CheckCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">
          {user ? t("successSignedIn") : t("success")}
        </p>
      </div>
      <p className="text-center text-sm text-slate-600">
        <Link
          href={user ? "/profile" : "/login"}
          className="font-semibold text-teal-600 hover:underline"
        >
          {user ? t("goToProfile") : t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
