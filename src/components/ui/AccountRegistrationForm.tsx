"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { UserPlus, AlertCircle, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { authClient } from "@/lib/auth-client";
import type { Locale } from "@/i18n/routing";
import type { AccountRegistrationFormData } from "@/types";

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  acceptTerms?: string;
  general?: string;
}

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

const errorInputClasses = "border-red-300 focus:border-red-500 focus:ring-red-500/20";

export function AccountRegistrationForm() {
  const t = useTranslations("accountRegister");
  const locale = useLocale() as Locale;
  const { register } = useAuth();

  const [formData, setFormData] = useState<AccountRegistrationFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const validateForm = (data: AccountRegistrationFormData): FormErrors => {
    const errs: FormErrors = {};
    if (!data.fullName.trim()) errs.fullName = t("errors.fullNameRequired");
    else if (data.fullName.trim().length < 2) errs.fullName = t("errors.fullNameMin");
    if (!data.email.trim()) errs.email = t("errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = t("errors.emailInvalid");
    if (!data.password) errs.password = t("errors.passwordRequired");
    else if (data.password.length < 8) errs.password = t("errors.passwordMin");
    if (!data.confirmPassword) errs.confirmPassword = t("errors.confirmPasswordRequired");
    else if (data.password !== data.confirmPassword) errs.confirmPassword = t("errors.passwordMismatch");
    if (data.phone && !/^[\d\s+()-]{7,}$/.test(data.phone)) errs.phone = t("errors.phoneInvalid");
    if (!data.acceptTerms) errs.acceptTerms = t("errors.termsRequired");
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await register(formData);
      setPendingVerification(true);
    } catch {
      setErrors({ general: t("errors.registerFailed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof AccountRegistrationFormData>(
    field: K,
    value: AccountRegistrationFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    }
    if (pendingVerification) {
      setPendingVerification(false);
      setResendState("idle");
    }
  };

  const handleResendVerification = async () => {
    if (resendState === "sending") return;
    setResendState("sending");
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: formData.email.trim().toLowerCase(),
        callbackURL: `/${locale}/verify-email`,
      });
      setResendState(error ? "error" : "sent");
    } catch {
      setResendState("error");
    }
  };

  if (pendingVerification) {
    return (
      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl bg-teal-50 p-4 text-teal-800"
        >
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{t("checkEmail")}</p>
        </motion.div>
        <div>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendState === "sending" || resendState === "sent"}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 underline disabled:no-underline disabled:opacity-70"
          >
            <Mail className="h-3.5 w-3.5" />
            {resendState === "sending"
              ? t("resendSending")
              : resendState === "sent"
                ? t("resendSent")
                : t("resendVerification")}
          </button>
          {resendState === "error" && (
            <p className="mt-1 text-sm text-red-600">{t("errors.resendFailed")}</p>
          )}
        </div>
        <p className="text-center text-sm text-slate-600">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-semibold text-teal-600 hover:underline">
            {t("login")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
        <label htmlFor="account-name" className="mb-2 block text-sm font-medium text-slate-700">
          {t("fullName")} <span className="text-red-500">*</span>
        </label>
        <input
          id="account-name"
          type="text"
          value={formData.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          className={`${inputClasses} ${errors.fullName ? errorInputClasses : ""}`}
          placeholder={t("fullNamePlaceholder")}
        />
        {errors.fullName && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.fullName}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="account-email" className="mb-2 block text-sm font-medium text-slate-700">
          {t("email")} <span className="text-red-500">*</span>
        </label>
        <input
          id="account-email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          className={`${inputClasses} ${errors.email ? errorInputClasses : ""}`}
          placeholder={t("emailPlaceholder")}
        />
        {errors.email && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.email}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="account-password" className="mb-2 block text-sm font-medium text-slate-700">
            {t("password")} <span className="text-red-500">*</span>
          </label>
          <input
            id="account-password"
            type="password"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            className={`${inputClasses} ${errors.password ? errorInputClasses : ""}`}
            placeholder={t("passwordPlaceholder")}
          />
          {errors.password && (
            <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.password}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="account-confirm" className="mb-2 block text-sm font-medium text-slate-700">
            {t("confirmPassword")} <span className="text-red-500">*</span>
          </label>
          <input
            id="account-confirm"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            className={`${inputClasses} ${errors.confirmPassword ? errorInputClasses : ""}`}
            placeholder={t("confirmPasswordPlaceholder")}
          />
          {errors.confirmPassword && (
            <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="account-phone" className="mb-2 block text-sm font-medium text-slate-700">
          {t("phone")}{" "}
          <span className="text-slate-400">({t("optional")})</span>
        </label>
        <input
          id="account-phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className={`${inputClasses} ${errors.phone ? errorInputClasses : ""}`}
          placeholder={t("phonePlaceholder")}
        />
        {errors.phone && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => updateField("acceptTerms", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm text-slate-600">
            {t("acceptTerms")}{" "}
            <Link href="/privacy-policy" className="text-teal-600 hover:underline">
              {t("privacyPolicy")}
            </Link>{" "}
            {t("and")}{" "}
            <Link href="/travel-contract" className="text-teal-600 hover:underline">
              {t("travelContract")}
            </Link>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.acceptTerms}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        <UserPlus className="h-4 w-4" />
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>

      <p className="text-center text-sm text-slate-600">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-semibold text-teal-600 hover:underline">
          {t("login")}
        </Link>
      </p>
    </form>
  );
}
