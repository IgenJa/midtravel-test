"use server";

import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/prisma";
import { getSession, isAdminRole } from "@/lib/session";
import { revalidateCompany } from "@/lib/content/cache";
import {
  COMPANY_SETTING_KEYS,
  type CompanySettingsInput,
} from "@/lib/content/company";

export type AdminSettingsResult =
  | { ok: true }
  | {
      ok: false;
      code: "UNAUTHORIZED" | "VALIDATION" | "SAVE_FAILED";
    };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_RE = /^[A-Za-z]{2}$/;
const FACEBOOK_RE = /^https:\/\/(www\.)?facebook\.com\//i;

async function requireAdmin() {
  const session = await getSession();
  return Boolean(session && isAdminRole(session.user.role));
}

function trimRequired(value: string | undefined): string {
  return value?.trim() ?? "";
}

export async function saveCompanySettings(
  input: CompanySettingsInput
): Promise<AdminSettingsResult> {
  if (!(await requireAdmin())) return { ok: false, code: "UNAUTHORIZED" };

  const data: CompanySettingsInput = {
    legalName: trimRequired(input.legalName),
    legalNameShort: trimRequired(input.legalNameShort),
    email: trimRequired(input.email).toLowerCase(),
    phone: trimRequired(input.phone),
    taxId: trimRequired(input.taxId),
    companyRegistryNumber: trimRequired(input.companyRegistryNumber),
    streetAddress: trimRequired(input.streetAddress),
    postalCode: trimRequired(input.postalCode),
    city: trimRequired(input.city),
    addressCountry: trimRequired(input.addressCountry).toUpperCase(),
    facebook: trimRequired(input.facebook),
  };

  const phoneDigits = data.phone.replace(/\D/g, "");

  if (
    !data.legalName ||
    !data.legalNameShort ||
    !EMAIL_RE.test(data.email) ||
    phoneDigits.length < 6 ||
    !data.taxId ||
    !data.companyRegistryNumber ||
    !data.streetAddress ||
    !data.postalCode ||
    !data.city ||
    !COUNTRY_RE.test(data.addressCountry) ||
    !FACEBOOK_RE.test(data.facebook)
  ) {
    return { ok: false, code: "VALIDATION" };
  }

  const rows = Object.entries(COMPANY_SETTING_KEYS).map(([field, key]) => ({
    key,
    value: data[field as keyof CompanySettingsInput],
  }));

  try {
    await prisma.$transaction(
      rows.map((row) =>
        prisma.siteSetting.upsert({
          where: { key: row.key },
          create: row,
          update: { value: row.value },
        })
      )
    );
    revalidateCompany();
    return { ok: true };
  } catch (error) {
    Sentry.captureException(error);
    return { ok: false, code: "SAVE_FAILED" };
  }
}
