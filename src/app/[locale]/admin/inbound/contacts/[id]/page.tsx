import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { EmailDeliveryPanel } from "@/components/admin/EmailDeliveryPanel";
import { InboundReadToggle } from "@/components/admin/InboundReadToggle";
import { InboundStatusBadge } from "@/components/admin/InboundStatusBadge";
import { ResendNotifyEmailsButton } from "@/components/admin/ResendNotifyEmailsButton";
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

export default async function AdminContactMessagePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const message = await prisma.contactMessage.findUnique({
    where: { id },
  });

  if (!message) notFound();

  return (
    <>
      <div className="mb-6">
        <Button href="/admin/inbound" size="sm" variant="ghost">
          ← {t("backToInbound")}
        </Button>
      </div>

      <SectionHeading
        eyebrow={t("kindContact")}
        title={t("contactDetailTitle")}
        description={message.subject}
        align="left"
      />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <InboundStatusBadge
          read={message.read}
          readLabel={t("readStatus")}
          unreadLabel={t("unreadStatus")}
        />
        <InboundReadToggle
          kind="contact"
          id={message.id}
          read={message.read}
        />
        <a
          href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
          className="inline-flex items-center justify-center rounded-full border-2 border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
        >
          {t("replyByEmail")}
        </a>
      </div>

      <dl className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldName")}
          </dt>
          <dd className="mt-1 font-medium text-slate-900">{message.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldEmail")}
          </dt>
          <dd className="mt-1">
            <a
              href={`mailto:${message.email}`}
              className="font-medium text-teal-700 hover:text-teal-800"
            >
              {message.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldSubject")}
          </dt>
          <dd className="mt-1 font-medium text-slate-900">{message.subject}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("receivedAt")}
          </dt>
          <dd className="mt-1 text-slate-700">
            {formatDateTime(message.createdAt.toISOString(), locale)}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("fieldMessage")}
          </dt>
          <dd className="mt-2 whitespace-pre-wrap text-slate-700">
            {message.message}
          </dd>
        </div>
      </dl>

      <EmailDeliveryPanel
        guestEmailStatus={message.guestEmailStatus}
        officeEmailStatus={message.officeEmailStatus}
        labels={{
          guest: t("emailGuestStatus"),
          office: t("emailOfficeStatus"),
          pending: t("emailSendStatus.pending"),
          sent: t("emailSendStatus.sent"),
          failed: t("emailSendStatus.failed"),
          warning: t("emailFailedWarning"),
        }}
      >
        <ResendNotifyEmailsButton kind="contact" id={message.id} />
      </EmailDeliveryPanel>
    </>
  );
}
