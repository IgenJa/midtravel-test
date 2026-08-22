"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/auth-client";

interface FormErrors {
  password?: string;
  confirmPassword?: string;
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

function isInvalidTokenError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code =
    "code" in error && typeof error.code === "string" ? error.code : "";
  const message =
    "message" in error && typeof error.message === "string" ? error.message : "";
  return (
    code === "INVALID_TOKEN" ||
    message.toUpperCase().includes("INVALID_TOKEN") ||
    message.toLowerCase().includes("invalid token")
  );
}

export function ResetPasswordForm({
  token,
  tokenInvalid,
}: {
  token?: string;
  tokenInvalid?: boolean;
}) {
  const t = useTranslations("resetPassword");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showRequestNewLink, setShowRequestNewLink] = useState(false);

  const missingToken = tokenInvalid || !token;

  useEffect(() => {
    if (!success) return;
    const timeoutId = window.setTimeout(() => {
      router.push("/login");
    }, 1500);
    return () => window.clearTimeout(timeoutId);
  }, [success, router]);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!password) errs.password = t("errors.passwordRequired");
    else if (password.length < 8) errs.password = t("errors.passwordMin");
    if (!confirmPassword) errs.confirmPassword = t("errors.confirmPasswordRequired");
    else if (password !== confirmPassword) {
      errs.confirmPassword = t("errors.passwordMismatch");
    }
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        if (isInvalidTokenError(error)) {
          setShowRequestNewLink(true);
          setErrors({ general: t("errors.invalidToken") });
        } else if (isRateLimitedError(error)) {
          setShowRequestNewLink(false);
          setErrors({ general: t("errors.rateLimited") });
        } else {
          setShowRequestNewLink(false);
          setErrors({ general: t("errors.resetFailed") });
        }
        return;
      }

      setSuccess(true);
    } catch {
      setErrors({ general: t("errors.resetFailed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (missingToken) {
    return (
      <p className="text-center text-sm text-slate-600">
        <Link
          href="/forgot-password"
          className="font-semibold text-teal-600 hover:underline"
        >
          {t("requestNewLink")}
        </Link>
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {success && (
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
          <div>
            <p className="text-sm font-medium">{errors.general}</p>
            {showRequestNewLink && (
              <Link
                href="/forgot-password"
                className="mt-1 inline-block text-sm font-semibold text-red-700 underline"
              >
                {t("requestNewLink")}
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {success ? (
        <p className="text-center text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-teal-600 hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      ) : (
        <>
          <div>
            <label htmlFor="reset-password" className="mb-2 block text-sm font-medium text-slate-700">
              {t("newPassword")} <span className="text-red-500">*</span>
            </label>
            <input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password || errors.general) {
                  setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
                }
              }}
              className={`${inputClasses} ${errors.password ? errorInputClasses : ""}`}
              placeholder={t("newPasswordPlaceholder")}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="reset-confirm-password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              {t("confirmPassword")} <span className="text-red-500">*</span>
            </label>
            <input
              id="reset-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              className={`${inputClasses} ${errors.confirmPassword ? errorInputClasses : ""}`}
              placeholder={t("confirmPasswordPlaceholder")}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            <KeyRound className="h-4 w-4" />
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>

          <p className="text-center text-sm text-slate-600">
            <Link href="/login" className="font-semibold text-teal-600 hover:underline">
              {t("backToLogin")}
            </Link>
          </p>
        </>
      )}
    </form>
  );
}
