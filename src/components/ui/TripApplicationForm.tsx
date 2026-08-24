"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link, useRouter } from "@/i18n/routing";
import { submitTripApplication } from "@/app/actions/apply";
import { createBookingCheckout } from "@/app/actions/booking";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import type { TripApplicationFormData } from "@/types";

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  participants?: string;
  tripSlug?: string;
  companionName?: string;
  companionPhone?: string;
  acceptPrivacy?: string;
  general?: string;
}

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

const errorInputClasses = "border-red-300 focus:border-red-500 focus:ring-red-500/20";

interface TripApplicationFormProps {
  defaultTripSlug?: string;
  trips: {
    slug: string;
    title: string;
    country: string;
    duration: number;
    price: number;
    remainingSeats: number;
    isFull: boolean;
  }[];
  depositPercent: number;
  stripeEnabled: boolean;
}

export function TripApplicationForm({
  defaultTripSlug,
  trips,
  depositPercent,
  stripeEnabled,
}: TripApplicationFormProps) {
  const t = useTranslations("tripApplication");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const emptyForm = (): TripApplicationFormData => ({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    participants: 1,
    tripSlug: defaultTripSlug ?? "",
    message: "",
    requestInsurance: false,
    hasCompanion: false,
    companionName: "",
    companionPhone: "",
    acceptPrivacy: false,
  });

  const [formData, setFormData] = useState<TripApplicationFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingMode, setSubmittingMode] = useState<"inquire" | "book" | null>(
    null
  );
  const [prefilledUserId, setPrefilledUserId] = useState<string | null>(
    user?.id ?? null
  );

  if (user && user.id !== prefilledUserId) {
    setPrefilledUserId(user.id);
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || user.fullName,
      email: prev.email || user.email,
      phone: prev.phone || user.phone,
    }));
  }

  const selectedTrip = trips.find((trip) => trip.slug === formData.tripSlug);
  const selectedTripFull = Boolean(selectedTrip?.isFull);
  const totalAmount = selectedTrip
    ? selectedTrip.price * Math.max(1, formData.participants || 1)
    : null;
  const depositAmount =
    totalAmount != null
      ? Math.max(1, Math.round((totalAmount * depositPercent) / 100))
      : null;

  const validateForm = (data: TripApplicationFormData): FormErrors => {
    const errs: FormErrors = {};
    if (!data.fullName.trim()) errs.fullName = t("errors.fullNameRequired");
    else if (data.fullName.trim().length < 2) errs.fullName = t("errors.fullNameMin");
    if (!data.email.trim()) errs.email = t("errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = t("errors.emailInvalid");
    if (!data.phone.trim()) errs.phone = t("errors.phoneRequired");
    else if (!/^[\d\s+()-]{7,}$/.test(data.phone)) errs.phone = t("errors.phoneInvalid");
    if (!data.participants || data.participants < 1) errs.participants = t("errors.participantsMin");
    else if (data.participants > 20) errs.participants = t("errors.participantsMax");
    if (!data.tripSlug) errs.tripSlug = t("errors.tripRequired");
    else {
      const trip = trips.find((item) => item.slug === data.tripSlug);
      if (trip?.isFull) {
        errs.general = t("errors.tripFull");
      } else if (trip && data.participants > trip.remainingSeats) {
        errs.participants = t("errors.notEnoughSeats", {
          count: trip.remainingSeats,
        });
      }
    }
    if (data.hasCompanion) {
      if (!data.companionName.trim()) errs.companionName = t("errors.companionNameRequired");
      else if (data.companionName.trim().length < 2) {
        errs.companionName = t("errors.companionNameMin");
      }
      if (!data.companionPhone.trim()) errs.companionPhone = t("errors.companionPhoneRequired");
      else if (!/^[\d\s+()-]{7,}$/.test(data.companionPhone)) {
        errs.companionPhone = t("errors.companionPhoneInvalid");
      }
    }
    if (!data.acceptPrivacy) errs.acceptPrivacy = t("errors.termsRequired");
    return errs;
  };

  const mapActionErrors = (
    result: {
      code: string;
      fieldErrors?: Partial<Record<string, string>>;
    }
  ): FormErrors => {
    if (result.code === "PRIVACY_REQUIRED") {
      return { acceptPrivacy: t("errors.termsRequired") };
    }
    if (result.code === "TRIP_NOT_FOUND") {
      return { tripSlug: t("errors.tripRequired") };
    }
    if (result.code === "AUTH_REQUIRED") {
      return { general: t("errors.authRequired") };
    }
    if (result.code === "STRIPE_NOT_CONFIGURED") {
      return { general: t("errors.stripeNotConfigured") };
    }
    if (result.code === "RATE_LIMITED") {
      return { general: t("errors.rateLimited") };
    }
    if (result.code === "TRIP_FULL") {
      return { participants: t("errors.tripFull") };
    }
    if (result.fieldErrors?.companionName) {
      return { companionName: t("errors.companionNameRequired") };
    }
    if (result.fieldErrors?.companionPhone) {
      return { companionPhone: t("errors.companionPhoneInvalid") };
    }
    return { general: t("errors.submitFailed") };
  };

  const handleInquire = async () => {
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmittingMode("inquire");
    setErrors({});

    try {
      const result = await submitTripApplication({ ...formData, locale });
      if (!result.ok) {
        setErrors(mapActionErrors(result));
        return;
      }

      setStatus("success");
      setFormData(emptyForm());
    } catch {
      setErrors({ general: t("errors.submitFailed") });
    } finally {
      setIsSubmitting(false);
      setSubmittingMode(null);
    }
  };

  const handleBook = async () => {
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    if (!isAuthenticated) {
      const returnTo = `/apply${formData.tripSlug ? `?trip=${formData.tripSlug}` : ""}`;
      router.push(`/login?next=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (!stripeEnabled) {
      setErrors({ general: t("errors.stripeNotConfigured") });
      return;
    }

    setIsSubmitting(true);
    setSubmittingMode("book");
    setErrors({});

    try {
      const result = await createBookingCheckout({ ...formData, locale });
      if (!result.ok) {
        if (result.code === "AUTH_REQUIRED") {
          const returnTo = `/apply${formData.tripSlug ? `?trip=${formData.tripSlug}` : ""}`;
          router.push(`/login?next=${encodeURIComponent(returnTo)}`);
          return;
        }
        setErrors(mapActionErrors(result));
        return;
      }

      window.location.href = result.url;
    } catch {
      setErrors({ general: t("errors.submitFailed") });
      setIsSubmitting(false);
      setSubmittingMode(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleInquire();
  };

  const updateField = <K extends keyof TripApplicationFormData>(
    field: K,
    value: TripApplicationFormData[K]
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
          <label htmlFor="apply-name" className="mb-2 block text-sm font-medium text-slate-700">
            {t("fullName")} <span className="text-red-500">*</span>
          </label>
          <input
            id="apply-name"
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
          <label htmlFor="apply-email" className="mb-2 block text-sm font-medium text-slate-700">
            {t("email")} <span className="text-red-500">*</span>
          </label>
          <input
            id="apply-email"
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="apply-phone" className="mb-2 block text-sm font-medium text-slate-700">
            {t("phone")} <span className="text-red-500">*</span>
          </label>
          <input
            id="apply-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={`${inputClasses} ${errors.phone ? errorInputClasses : ""}`}
          />
          {errors.phone && (
            <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.phone}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="apply-participants" className="mb-2 block text-sm font-medium text-slate-700">
            {t("participants")} <span className="text-red-500">*</span>
          </label>
          <input
            id="apply-participants"
            type="number"
            min={1}
            max={20}
            value={formData.participants}
            onChange={(e) => updateField("participants", parseInt(e.target.value) || 0)}
            className={`${inputClasses} ${errors.participants ? errorInputClasses : ""}`}
          />
          {errors.participants && (
            <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.participants}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="apply-trip" className="mb-2 block text-sm font-medium text-slate-700">
          {t("selectTrip")} <span className="text-red-500">*</span>
        </label>
        <select
          id="apply-trip"
          value={formData.tripSlug}
          onChange={(e) => updateField("tripSlug", e.target.value)}
          className={`${inputClasses} ${errors.tripSlug ? errorInputClasses : ""}`}
        >
          <option value="">{t("chooseDestination")}</option>
          {trips.map((trip) => (
            <option key={trip.slug} value={trip.slug}>
              {trip.title} — {trip.country} ({trip.duration} {tCommon("days")}) ·{" "}
              {formatPrice(trip.price)}
              {trip.isFull
                ? ` — ${t("tripFull")}`
                : ` — ${t("spotsLeft", { count: trip.remainingSeats })}`}
            </option>
          ))}
        </select>
        {errors.tripSlug && (
          <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.tripSlug}
          </p>
        )}
        {selectedTrip && !errors.tripSlug ? (
          <p
            className={`mt-1 text-sm ${
              selectedTripFull ? "text-red-600" : "text-slate-500"
            }`}
          >
            {selectedTripFull
              ? t("tripFull")
              : t("spotsLeft", { count: selectedTrip.remainingSeats })}
          </p>
        ) : null}
      </div>

      {depositAmount != null && totalAmount != null && (
        <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-4 text-sm text-teal-900">
          <p className="font-medium">{t("depositSummaryTitle")}</p>
          <p className="mt-1">
            {t("depositSummary", {
              percent: depositPercent,
              deposit: formatPrice(depositAmount),
              total: formatPrice(totalAmount),
            })}
          </p>
          {!isAuthenticated && (
            <p className="mt-2 text-teal-800/80">{t("depositLoginHint")}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="apply-message" className="mb-2 block text-sm font-medium text-slate-700">
          {t("message")}{" "}
          <span className="text-slate-400">({tCommon("optional")})</span>
        </label>
        <textarea
          id="apply-message"
          rows={4}
          value={formData.message}
          onChange={(e) => updateField("message", e.target.value)}
          className={`${inputClasses} resize-none`}
          placeholder={t("messagePlaceholder")}
        />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <input
          id="apply-insurance"
          type="checkbox"
          checked={formData.requestInsurance}
          onChange={(e) => updateField("requestInsurance", e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
        />
        <span className="text-sm leading-relaxed text-slate-600">
          {t("requestInsurance")}
        </span>
      </label>

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <label className="flex items-start gap-3">
          <input
            id="apply-companion"
            type="checkbox"
            checked={formData.hasCompanion}
            onChange={(e) => updateField("hasCompanion", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            aria-controls="apply-companion-fields"
            aria-expanded={formData.hasCompanion}
          />
          <span className="text-sm leading-relaxed text-slate-600">
            {t("hasCompanion")}
          </span>
        </label>
        <AnimatePresence initial={false}>
          {formData.hasCompanion && (
            <motion.div
              id="apply-companion-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="mt-3 text-sm text-slate-500">{t("companionHint")}</p>
              <div className="mt-3 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="apply-companion-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    {t("companionName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="apply-companion-name"
                    type="text"
                    autoComplete="name"
                    value={formData.companionName}
                    onChange={(e) => updateField("companionName", e.target.value)}
                    className={`${inputClasses} ${errors.companionName ? errorInputClasses : ""}`}
                  />
                  {errors.companionName && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.companionName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="apply-companion-phone"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    {t("companionPhone")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="apply-companion-phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.companionPhone}
                    onChange={(e) => updateField("companionPhone", e.target.value)}
                    className={`${inputClasses} ${errors.companionPhone ? errorInputClasses : ""}`}
                  />
                  {errors.companionPhone && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.companionPhone}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
            </Link>{" "}
            {t("and")}{" "}
            <Link href="/travel-contract" className="text-teal-600 hover:underline">
              {t("travelContract")}
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

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || selectedTripFull}
          className="w-full"
        >
          <Send className="h-4 w-4" />
          {submittingMode === "inquire" ? t("submitting") : t("submit")}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          disabled={isSubmitting || selectedTripFull}
          className="w-full"
          onClick={handleBook}
        >
          <CreditCard className="h-4 w-4" />
          {submittingMode === "book" ? t("bookingRedirecting") : t("bookAndPay")}
        </Button>
      </div>
    </form>
  );
}
