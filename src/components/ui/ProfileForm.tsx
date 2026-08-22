"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { Save, LogOut, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfileUpdate } from "@/types";

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

const errorInputClasses = "border-red-300 focus:border-red-500 focus:ring-red-500/20";

export function ProfileForm() {
  const t = useTranslations("profile");
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<UserProfileUpdate>({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "success" | "emailPending">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const validateForm = (data: UserProfileUpdate): FormErrors => {
    const errs: FormErrors = {};
    if (!data.fullName.trim()) errs.fullName = t("errors.fullNameRequired");
    else if (data.fullName.trim().length < 2) errs.fullName = t("errors.fullNameMin");
    if (!data.email.trim()) errs.email = t("errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = t("errors.emailInvalid");
    if (data.phone && !/^[\d\s+()-]{7,}$/.test(data.phone)) errs.phone = t("errors.phoneInvalid");

    if (showPasswordFields) {
      if (!data.currentPassword) errs.currentPassword = t("errors.currentPasswordRequired");
      if (!data.newPassword) errs.newPassword = t("errors.newPasswordRequired");
      else if (data.newPassword.length < 8) errs.newPassword = t("errors.newPasswordMin");
      if (!data.confirmPassword) errs.confirmPassword = t("errors.confirmPasswordRequired");
      else if (data.newPassword !== data.confirmPassword) errs.confirmPassword = t("errors.passwordMismatch");
    }

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
      const result = await updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        ...(showPasswordFields && formData.newPassword
          ? {
              currentPassword: formData.currentPassword,
              password: formData.newPassword,
            }
          : {}),
      });
      setStatus(result.emailChangePending ? "emailPending" : "success");
      setFormData((prev) => ({
        ...prev,
        email: result.user.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setShowPasswordFields(false);
    } catch (error) {
      if (error instanceof Error && error.message === "EMAIL_EXISTS") {
        setErrors({ email: t("errors.emailExists") });
      } else if (error instanceof Error && error.message === "EMAIL_CHANGE_FAILED") {
        setErrors({ email: t("errors.emailChangeFailed") });
      } else if (error instanceof Error && error.message === "INVALID_CURRENT_PASSWORD") {
        setErrors({ currentPassword: t("errors.currentPasswordInvalid") });
      } else {
        setErrors({ general: t("errors.saveFailed") });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const updateField = <K extends keyof UserProfileUpdate>(
    field: K,
    value: UserProfileUpdate[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    }
    if (status !== "idle") setStatus("idle");
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {(status === "success" || status === "emailPending") && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-xl bg-teal-50 p-4 text-teal-800"
          >
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              {status === "emailPending" ? t("emailChangePending") : t("success")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {errors.general && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-slate-700">
            {t("fullName")} <span className="text-red-500">*</span>
          </label>
          <input
            id="profile-name"
            type="text"
            value={formData.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className={`${inputClasses} ${errors.fullName ? errorInputClasses : ""}`}
          />
          {errors.fullName && (
            <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="profile-email" className="mb-2 block text-sm font-medium text-slate-700">
            {t("email")} <span className="text-red-500">*</span>
          </label>
          <input
            id="profile-email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={`${inputClasses} ${errors.email ? errorInputClasses : ""}`}
          />
          {errors.email ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.email}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">{t("emailHint")}</p>
          )}
        </div>

        <div>
          <label htmlFor="profile-phone" className="mb-2 block text-sm font-medium text-slate-700">
            {t("phone")}
          </label>
          <input
            id="profile-phone"
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

        <div className="border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="text-sm font-semibold text-teal-600 hover:underline"
          >
            {showPasswordFields ? t("hidePasswordChange") : t("changePassword")}
          </button>

          {showPasswordFields && (
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="profile-current-password" className="mb-2 block text-sm font-medium text-slate-700">
                  {t("currentPassword")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="profile-current-password"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => updateField("currentPassword", e.target.value)}
                  className={`${inputClasses} ${errors.currentPassword ? errorInputClasses : ""}`}
                />
                {errors.currentPassword && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="profile-new-password" className="mb-2 block text-sm font-medium text-slate-700">
                    {t("newPassword")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="profile-new-password"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => updateField("newPassword", e.target.value)}
                    className={`${inputClasses} ${errors.newPassword ? errorInputClasses : ""}`}
                  />
                  {errors.newPassword && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.newPassword}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="profile-confirm-password" className="mb-2 block text-sm font-medium text-slate-700">
                    {t("confirmPassword")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    className={`${inputClasses} ${errors.confirmPassword ? errorInputClasses : ""}`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={isSubmitting} className="sm:flex-1">
            <Save className="h-4 w-4" />
            {isSubmitting ? t("saving") : t("save")}
          </Button>
          <Button type="button" variant="outline" onClick={handleLogout} className="sm:flex-1">
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </Button>
        </div>
      </form>
    </div>
  );
}
