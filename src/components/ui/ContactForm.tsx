"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/routing";
import { submitContactMessage } from "@/app/actions/contact";
import type { ContactFormData } from "@/types";

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  acceptPrivacy?: string;
  general?: string;
}

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

const errorInputClasses = "border-red-300 focus:border-red-500 focus:ring-red-500/20";

const emptyForm: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
  acceptPrivacy: false,
};

export function ContactForm() {
  const t = useTranslations("contact");
  const [formData, setFormData] = useState<ContactFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (data: ContactFormData): FormErrors => {
    const errs: FormErrors = {};
    if (!data.name.trim()) errs.name = t("errors.nameRequired");
    else if (data.name.trim().length < 2) errs.name = t("errors.nameMin");
    if (!data.email.trim()) errs.email = t("errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = t("errors.emailInvalid");
    if (!data.subject.trim()) errs.subject = t("errors.subjectRequired");
    if (!data.message.trim()) errs.message = t("errors.messageRequired");
    else if (data.message.trim().length < 10) errs.message = t("errors.messageMin");
    if (!data.acceptPrivacy) errs.acceptPrivacy = t("errors.privacyRequired");
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
      const result = await submitContactMessage(formData);
      if (!result.ok) {
        if (result.code === "PRIVACY_REQUIRED") {
          setErrors({ acceptPrivacy: t("errors.privacyRequired") });
        } else if (result.code === "RATE_LIMITED") {
          setErrors({ general: t("errors.rateLimited") });
        } else {
          setErrors({ general: t("errors.submitFailed") });
        }
        return;
      }

      setStatus("success");
      setFormData(emptyForm);
    } catch {
      setErrors({ general: t("errors.submitFailed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    }
    if (status === "success") setStatus("idle");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <AnimatePresence mode="wait">
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-xl bg-teal-50 p-4 text-teal-800"
          >
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{t("success")}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {errors.general && (
        <p className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errors.general}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-slate-700">
            {t("name")}
          </label>
          <input
            id="contact-name"
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={`${inputClasses} ${errors.name ? errorInputClasses : ""}`}
          />
          {errors.name && (
            <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-slate-700">
            {t("email")}
          </label>
          <input
            id="contact-email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={`${inputClasses} ${errors.email ? errorInputClasses : ""}`}
          />
          {errors.email && (
            <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-2 block text-sm font-medium text-slate-700">
          {t("subject")}
        </label>
        <input
          id="contact-subject"
          type="text"
          value={formData.subject}
          onChange={(e) => updateField("subject", e.target.value)}
          className={`${inputClasses} ${errors.subject ? errorInputClasses : ""}`}
        />
        {errors.subject && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.subject}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-slate-700">
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={formData.message}
          onChange={(e) => updateField("message", e.target.value)}
          className={`${inputClasses} resize-none ${errors.message ? errorInputClasses : ""}`}
        />
        {errors.message && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.message}
          </p>
        )}
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.acceptPrivacy}
            onChange={(e) => updateField("acceptPrivacy", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm text-slate-600">
            {t("acceptPrivacy")}{" "}
            <Link href="/privacy-policy" className="text-teal-600 hover:underline">
              {t("privacyPolicy")}
            </Link>
          </span>
        </label>
        {errors.acceptPrivacy && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.acceptPrivacy}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        <Send className="h-4 w-4" />
        {isSubmitting ? t("sending") : t("send")}
      </Button>
    </form>
  );
}
