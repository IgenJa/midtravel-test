"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { saveCompanySettings } from "@/app/actions/admin/settings";
import type { CompanySettingsInput } from "@/lib/content/company";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

type Props = {
  initial: CompanySettingsInput;
};

export function CompanySettingsForm({ initial }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<CompanySettingsInput>(initial);

  const setField =
    (field: keyof CompanySettingsInput) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSaved(false);
      setForm({ ...form, [field]: event.target.value });
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await saveCompanySettings(form);
    setSaving(false);

    if (!result.ok) {
      setError(t(`errors.${result.code}`));
      return;
    }

    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <legend className="px-1 font-display text-lg font-bold text-slate-900">
          {t("settingsContact")}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium" htmlFor="company-email">
              {t("fieldEmail")}
            </label>
            <input
              id="company-email"
              type="email"
              className={inputClasses}
              value={form.email}
              onChange={setField("email")}
              autoComplete="email"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium" htmlFor="company-phone">
              {t("fieldPhone")}
            </label>
            <input
              id="company-phone"
              type="tel"
              className={inputClasses}
              value={form.phone}
              onChange={setField("phone")}
              autoComplete="tel"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium" htmlFor="company-street">
              {t("fieldBillingStreet")}
            </label>
            <input
              id="company-street"
              className={inputClasses}
              value={form.streetAddress}
              onChange={setField("streetAddress")}
              autoComplete="street-address"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="company-zip">
              {t("fieldBillingZip")}
            </label>
            <input
              id="company-zip"
              className={inputClasses}
              value={form.postalCode}
              onChange={setField("postalCode")}
              autoComplete="postal-code"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="company-city">
              {t("fieldBillingCity")}
            </label>
            <input
              id="company-city"
              className={inputClasses}
              value={form.city}
              onChange={setField("city")}
              autoComplete="address-level2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="company-country">
              {t("fieldBillingCountry")}
            </label>
            <input
              id="company-country"
              className={inputClasses}
              value={form.addressCountry}
              onChange={setField("addressCountry")}
              autoComplete="country"
              maxLength={2}
              required
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <legend className="px-1 font-display text-lg font-bold text-slate-900">
          {t("settingsLegal")}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium" htmlFor="company-legal-name">
              {t("fieldLegalName")}
            </label>
            <input
              id="company-legal-name"
              className={inputClasses}
              value={form.legalName}
              onChange={setField("legalName")}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="company-legal-short">
              {t("fieldLegalNameShort")}
            </label>
            <input
              id="company-legal-short"
              className={inputClasses}
              value={form.legalNameShort}
              onChange={setField("legalNameShort")}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="company-tax">
              {t("fieldTaxId")}
            </label>
            <input
              id="company-tax"
              className={inputClasses}
              value={form.taxId}
              onChange={setField("taxId")}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium" htmlFor="company-registry">
              {t("fieldCompanyRegistryNumber")}
            </label>
            <input
              id="company-registry"
              className={inputClasses}
              value={form.companyRegistryNumber}
              onChange={setField("companyRegistryNumber")}
              required
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <legend className="px-1 font-display text-lg font-bold text-slate-900">
          {t("settingsSocial")}
        </legend>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="company-facebook">
            {t("fieldFacebook")}
          </label>
          <input
            id="company-facebook"
            type="url"
            className={inputClasses}
            value={form.facebook}
            onChange={setField("facebook")}
            required
          />
        </div>
      </fieldset>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {saved ? (
        <p className="text-sm font-medium text-teal-700">{t("settingsSaved")}</p>
      ) : null}

      <Button type="submit" disabled={saving}>
        {saving ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
