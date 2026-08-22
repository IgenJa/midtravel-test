import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmailFailedBadge } from "@/components/admin/EmailFailedBadge";
import { InboundReadToggle } from "@/components/admin/InboundReadToggle";
import { InboundStatusBadge } from "@/components/admin/InboundStatusBadge";
import { hasFailedEmail } from "@/lib/email-delivery";
import { prisma } from "@/lib/prisma";
import { createMetadata } from "@/lib/seo";
import { cn, formatDateTime } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
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

export default async function AdminInboundPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const [contacts, applications] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
    }),
    prisma.tripApplication.findMany({
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
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
    }),
  ]);

  const unreadContacts = contacts.filter((item) => !item.read).length;
  const unreadApplications = applications.filter((item) => !item.read).length;

  return (
    <>
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("inboundTitle")}
        description={t("inboundDescription")}
        align="left"
      />

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {t("contactsTitle")}
          </h2>
          <p className="text-sm text-slate-500">
            {t("unreadCount", { count: unreadContacts })}
          </p>
        </div>

        {contacts.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
            {t("emptyContacts")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("status")}</th>
                  <th className="px-4 py-3 font-semibold">{t("fieldName")}</th>
                  <th className="px-4 py-3 font-semibold">{t("fieldSubject")}</th>
                  <th className="px-4 py-3 font-semibold">{t("receivedAt")}</th>
                  <th className="px-4 py-3 font-semibold">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((item) => {
                  const emailFailed = hasFailedEmail(item);

                  return (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-slate-100",
                      emailFailed
                        ? "bg-red-50/60"
                        : !item.read && "bg-amber-50/40"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <InboundStatusBadge
                          read={item.read}
                          readLabel={t("readStatus")}
                          unreadLabel={t("unreadStatus")}
                        />
                        <EmailFailedBadge
                          guestEmailStatus={item.guestEmailStatus}
                          officeEmailStatus={item.officeEmailStatus}
                          label={t("emailFailedBadge")}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={cn(
                          "text-slate-900",
                          !item.read && "font-semibold"
                        )}
                      >
                        {item.name}
                      </div>
                      <a
                        href={`mailto:${item.email}`}
                        className="text-xs text-teal-700 hover:text-teal-800"
                      >
                        {item.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.subject}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {formatDateTime(item.createdAt.toISOString(), locale)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/inbound/contacts/${item.id}`}
                          className="text-sm font-semibold text-teal-700 hover:text-teal-800"
                        >
                          {t("openInbound")}
                        </Link>
                        <InboundReadToggle
                          kind="contact"
                          id={item.id}
                          read={item.read}
                        />
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {t("applicationsTitle")}
          </h2>
          <p className="text-sm text-slate-500">
            {t("unreadCount", { count: unreadApplications })}
          </p>
        </div>

        {applications.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
            {t("emptyApplications")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("status")}</th>
                  <th className="px-4 py-3 font-semibold">{t("fieldName")}</th>
                  <th className="px-4 py-3 font-semibold">{t("fieldTrip")}</th>
                  <th className="px-4 py-3 font-semibold">
                    {t("fieldParticipants")}
                  </th>
                  <th className="px-4 py-3 font-semibold">{t("receivedAt")}</th>
                  <th className="px-4 py-3 font-semibold">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => {
                  const title = tripTitle(
                    item.trip?.translations ?? [],
                    locale,
                    item.tripSlug
                  );
                  const emailFailed = hasFailedEmail(item);

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "border-b border-slate-100",
                        emailFailed
                          ? "bg-red-50/60"
                          : !item.read && "bg-amber-50/40"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <InboundStatusBadge
                            read={item.read}
                            readLabel={t("readStatus")}
                            unreadLabel={t("unreadStatus")}
                          />
                          <EmailFailedBadge
                            guestEmailStatus={item.guestEmailStatus}
                            officeEmailStatus={item.officeEmailStatus}
                            label={t("emailFailedBadge")}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={cn(
                            "text-slate-900",
                            !item.read && "font-semibold"
                          )}
                        >
                          {item.fullName}
                        </div>
                        <a
                          href={`mailto:${item.email}`}
                          className="text-xs text-teal-700 hover:text-teal-800"
                        >
                          {item.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{title}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {item.participants}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {formatDateTime(item.createdAt.toISOString(), locale)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/inbound/applications/${item.id}`}
                            className="text-sm font-semibold text-teal-700 hover:text-teal-800"
                          >
                            {t("openInbound")}
                          </Link>
                          <InboundReadToggle
                            kind="application"
                            id={item.id}
                            read={item.read}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
