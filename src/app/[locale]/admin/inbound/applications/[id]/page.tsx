import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ApplicationStatusActions } from "@/components/admin/ApplicationStatusActions";
import { ApplicationStatusBadge } from "@/components/admin/ApplicationStatusBadge";
import { EmailDeliveryPanel } from "@/components/admin/EmailDeliveryPanel";
import { InboundReadToggle } from "@/components/admin/InboundReadToggle";
import { InboundStatusBadge } from "@/components/admin/InboundStatusBadge";
import { LegalAcceptancePanel } from "@/components/admin/LegalAcceptancePanel";
import { ResendNotifyEmailsButton } from "@/components/admin/ResendNotifyEmailsButton";
import { legalDocumentHref } from "@/data/legal-docs";
import { prisma } from "@/lib/prisma";
import { createMetadata } from "@/lib/seo";
import { formatDateTime } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("adminInboundTitle"),
    description: t("adminDescription"),
    path: "/admin/inbound",
    locale: locale as Locale,
    siteTagline: t("siteTagline"),
  });
}

function tripTitle(
  translations: { locale: string; title: string }[],
  locale: string,
  fallback: string
) {
  return (
    translations.find((item) => item.locale === locale)?.title ??
    translations.find((item) => item.locale === "en")?.title ??
    translations[0]?.title ??
    fallback
  );
}

export default async function AdminTripApplicationPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const application = await prisma.tripApplication.findUnique({
    where: { id },
    include: {
      trip: {
        include: {
          translations: {
            where: { locale: { in: [locale, "en", "hu"] } },
            select: { locale: true, title: true },
          },
        },
      },
    },
  });

  if (!application) notFound();

  const title = tripTitle(
    application.trip?.translations ?? [],
    locale,
    application.tripSlug
  );

  return (
    <>
      <div className="mb-6">
        <Button href="/admin/inbound" size="sm" variant="ghost">
          ← {t("backToInbound")}
        </Button>
      </div>

      <SectionHeading
        eyebrow={t("kindApplication")}
        title={t("applicationDetailTitle")}
        description={title}
        align="left"
      />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <ApplicationStatusBadge
          status={application.status}
          labels={{
            open: t("applicationStatus.open"),
            converted: t("applicationStatus.converted"),
            released: t("applicationStatus.released"),
          }}
        />
        <InboundStatusBadge
          read={application.read}
          readLabel={t("readStatus")}
          unreadLabel={t("unreadStatus")}
        />
        <InboundReadToggle
          kind="application"
          id={application.id}
          read={application.read}
        />
        <ApplicationStatusActions
          id={application.id}
          status={application.status}
          participants={application.participants}
        />
        <a
          href={`mailto:${application.email}?subject=${encodeURIComponent(title)}`}
          className="inline-flex items-center justify-center rounded-full border-2 border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
        >
          {t("replyByEmail")}
        </a>
        {application.bookingId ? (
          <Button
            href={`/admin/bookings/${application.bookingId}`}
            size="sm"
            variant="ghost"
          >
            {t("openLinkedBooking")}
          </Button>
        ) : null}
      </div>

      <dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldName")}
          </dt>
          <dd className="mt-1 font-medium text-slate-900">
            {application.fullName}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldEmail")}
          </dt>
          <dd className="mt-1">
            <a
              href={`mailto:${application.email}`}
              className="font-medium text-teal-700 hover:text-teal-800"
            >
              {application.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldPhone")}
          </dt>
          <dd className="mt-1">
            <a
              href={`tel:${application.phone}`}
              className="font-medium text-teal-700 hover:text-teal-800"
            >
              {application.phone}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldParticipants")}
          </dt>
          <dd className="mt-1 font-medium text-slate-900">
            {application.participants}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldTrip")}
          </dt>
          <dd className="mt-1 font-medium text-slate-900">
            {title}
            <div className="text-xs font-normal text-slate-500">
              {application.tripSlug}
            </div>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldInsurance")}
          </dt>
          <dd className="mt-1 text-slate-700">
            {application.requestInsurance
              ? t("insuranceYes")
              : t("insuranceNo")}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldCompanion")}
          </dt>
          <dd className="mt-1 text-slate-700">
            {application.companionName ? (
              <>
                <div className="font-medium text-slate-900">
                  {application.companionName}
                </div>
                {application.companionPhone && (
                  <a
                    href={`tel:${application.companionPhone}`}
                    className="text-sm font-medium text-teal-700 hover:text-teal-800"
                  >
                    {application.companionPhone}
                  </a>
                )}
              </>
            ) : (
              t("companionNone")
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("receivedAt")}
          </dt>
          <dd className="mt-1 text-slate-700">
            {formatDateTime(application.createdAt.toISOString(), locale)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldMessage")}
          </dt>
          <dd className="mt-2 whitespace-pre-wrap text-slate-700">
            {application.message?.trim() ? application.message : "—"}
          </dd>
        </div>
      </dl>

      <LegalAcceptancePanel
        acceptedAt={
          application.termsAcceptedAt
            ? formatDateTime(application.termsAcceptedAt.toISOString(), locale)
            : null
        }
        privacy={{
          label: t("legalPrivacyDoc"),
          version: application.privacyDocVersion,
          sha256: application.privacyDocSha256,
          href: legalDocumentHref("privacy", application.privacyDocVersion),
        }}
        contract={{
          label: t("legalContractDoc"),
          version: application.contractDocVersion,
          sha256: application.contractDocSha256,
          href: legalDocumentHref("contract", application.contractDocVersion),
        }}
        labels={{
          title: t("legalAcceptanceTitle"),
          acceptedAt: t("legalAcceptedAt"),
          hash: t("legalDocHash"),
          missing: t("legalAcceptanceMissing"),
          openPdf: t("legalOpenPdf"),
        }}
      />

      {application.status === "converted" ? (
        <p className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {t("convertedApplicationNote")}
        </p>
      ) : (
        <EmailDeliveryPanel
          guestEmailStatus={application.guestEmailStatus}
          officeEmailStatus={application.officeEmailStatus}
          labels={{
            guest: t("emailGuestStatus"),
            office: t("emailOfficeStatus"),
            pending: t("emailSendStatus.pending"),
            sent: t("emailSendStatus.sent"),
            failed: t("emailSendStatus.failed"),
            warning: t("emailFailedWarning"),
          }}
        >
          <ResendNotifyEmailsButton kind="application" id={application.id} />
        </EmailDeliveryPanel>
      )}
    </>
  );
}
