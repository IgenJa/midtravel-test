import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  COMPANY,
  COMPANY_SETTING_KEYS,
  getCompany,
  type CompanyFactOverrides,
} from "@/data/company";
import type { Locale } from "@/i18n/routing";

export { COMPANY_SETTING_KEYS };

export type CompanySettingKey =
  (typeof COMPANY_SETTING_KEYS)[keyof typeof COMPANY_SETTING_KEYS];

export type CompanySettingsInput = {
  legalName: string;
  legalNameShort: string;
  email: string;
  phone: string;
  taxId: string;
  companyRegistryNumber: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  addressCountry: string;
  facebook: string;
};

const SETTING_KEY_TO_FIELD = Object.fromEntries(
  Object.entries(COMPANY_SETTING_KEYS).map(([field, key]) => [key, field])
) as Record<CompanySettingKey, keyof CompanySettingsInput>;

export function defaultCompanySettings(): CompanySettingsInput {
  return {
    legalName: COMPANY.legalName,
    legalNameShort: COMPANY.legalNameShort,
    email: COMPANY.email,
    phone: COMPANY.phone,
    taxId: COMPANY.taxId,
    companyRegistryNumber: COMPANY.companyRegistryNumber,
    streetAddress: COMPANY.streetAddress,
    postalCode: COMPANY.postalCode,
    city: COMPANY.city,
    addressCountry: COMPANY.addressCountry,
    facebook: COMPANY.social.facebook,
  };
}

export const getCompanyFactOverrides = cache(
  async (): Promise<CompanyFactOverrides> => {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: Object.values(COMPANY_SETTING_KEYS) } },
    });

    const overrides: CompanyFactOverrides = {};

    for (const row of rows) {
      const field = SETTING_KEY_TO_FIELD[row.key as CompanySettingKey];
      if (!field) continue;
      const value = row.value.trim();
      if (value) overrides[field] = value;
    }

    return overrides;
  }
);

export async function getCompanySettings(): Promise<CompanySettingsInput> {
  return {
    ...defaultCompanySettings(),
    ...(await getCompanyFactOverrides()),
  };
}

export async function getResolvedCompany(locale: Locale) {
  return getCompany(locale, await getCompanyFactOverrides());
}
