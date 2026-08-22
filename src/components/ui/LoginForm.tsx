"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { LogIn, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { authClient } from "@/lib/auth-client";
import type { Locale } from "@/i18n/routing";
import type { LoginFormData } from "@/types";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

const errorInputClasses = "border-red-300 focus:border-red-500 focus:ring-red-500/20";

export function LoginForm({ nextPath = "/profile" }: { nextPath?: string }) {
  const t = useTranslations("accountLogin");
  const locale = useLocale() as Locale;
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const validateForm = (data: LoginFormData): FormErrors => {
    const errs: FormErrors = {};
    if (!data.email.trim()) errs.email = t("errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = t("errors.emailInvalid");
    if (!data.password) errs.password = t("errors.passwordRequired");
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setErrors({});
    setUnverifiedEmail(null);
    setResendState("idle");

    try {
      await login(formData.email, formData.password, formData.rememberMe);
      router.push(nextPath);
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(formData.email.trim().toLowerCase());
        setErrors({ general: t("errors.emailNotVerified") });
      } else {
        setErrors({ general: t("errors.invalidCredentials") });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof LoginFormData>(
    field: K,
    value: LoginFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    }
    if (unverifiedEmail) {
      setUnverifiedEmail(null);
      setResendState("idle");
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail || resendState === "sending") return;
    setResendState("sending");
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: unverifiedEmail,
        callbackURL: `/${locale}/verify-email`,
      });
      setResendState(error ? "error" : "sent");
    } catch {
      setResendState("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-800"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-medium">{errors.general}</p>
            {unverifiedEmail && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendState === "sending" || resendState === "sent"}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 underline disabled:no-underline disabled:opacity-70"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {resendState === "sending"
                    ? t("resendSending")
                    : resendState === "sent"
                      ? t("resendSent")
                      : t("resendVerification")}
                </button>
                {resendState === "error" && (
                  <p className="mt-1 text-sm">{t("errors.resendFailed")}</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div>
        <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">
          {t("email")} <span className="text-red-500">*</span>
        </label>
        <input
          id="login-email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
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

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
            {t("password")} <span className="text-red-500">*</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-teal-600 hover:underline">
            {t("forgotPassword")}
          </Link>
        </div>
        <input
          id="login-password"
          type="password"
          value={formData.password}
          onChange={(e) => updateField("password", e.target.value)}
          className={`${inputClasses} ${errors.password ? errorInputClasses : ""}`}
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.password}
          </p>
        )}
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={formData.rememberMe}
          onChange={(e) => updateField("rememberMe", e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
        />
        <span className="text-sm text-slate-600">{t("rememberMe")}</span>
      </label>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        <LogIn className="h-4 w-4" />
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>

      <p className="text-center text-sm text-slate-600">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-semibold text-teal-600 hover:underline">
          {t("signUp")}
        </Link>
      </p>
    </form>
  );
}
