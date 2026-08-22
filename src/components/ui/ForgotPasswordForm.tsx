"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";
import type { Locale } from "@/i18n/routing";

interface FormErrors {
  email?: string;
  general?: string;
}

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

const errorInputClasses = "border-red-300 focus:border-red-500 focus:ring-red-500/20";

function isRateLimitedError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 429
  );
}

export function ForgotPasswordForm() {
  const t = useTranslations("forgotPassword");
  const locale = useLocale() as Locale;

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = (value: string): FormErrors => {
    const errs: FormErrors = {};
    if (!value.trim()) errs.email = t("errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errs.email = t("errors.emailInvalid");
    }
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(email);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setErrors({});
    setSent(false);

    try {
      const { error } = await authClient.requestPasswordReset({
        email: email.trim().toLowerCase(),
        redirectTo: `/${locale}/reset-password`,
      });

      if (error) {
        setErrors({
          general: isRateLimitedError(error)
            ? t("errors.rateLimited")
            : t("errors.sendFailed"),
        });
        return;
      }

      setSent(true);
    } catch {
      setErrors({ general: t("errors.sendFailed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {sent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl bg-teal-50 p-4 text-teal-800"
        >
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{t("success")}</p>
        </motion.div>
      )}

      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-800"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{errors.general}</p>
        </motion.div>
      )}

      <div>
        <label htmlFor="forgot-email" className="mb-2 block text-sm font-medium text-slate-700">
          {t("email")} <span className="text-red-500">*</span>
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email || errors.general) {
              setErrors({});
            }
            if (sent) setSent(false);
          }}
          className={`${inputClasses} ${errors.email ? errorInputClasses : ""}`}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.email}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        <Mail className="h-4 w-4" />
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>

      <p className="text-center text-sm text-slate-600">
        <Link href="/login" className="font-semibold text-teal-600 hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
