import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { failedEmailWhere } from "@/lib/email-delivery";
import { prisma } from "@/lib/prisma";
import { createMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("adminTitle"),
    description: t("adminDescription"),
    path: "/admin",
    locale: locale as Locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const [
    tripCount,
    teamCount,
    testimonialCount,
    contactCount,
    applicationCount,
    bookingCount,
    unreadBookingCount,
    failedContacts,
    failedApplications,
    failedBookings,
  ] =
    await Promise.all([
      prisma.trip.count(),
      prisma.teamMember.count(),
      prisma.testimonial.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.tripApplication.count({
        where: { read: false, status: "open" },
      }),
      prisma.booking.count(),
      prisma.booking.count({ where: { read: false, status: "paid" } }),
      prisma.contactMessage.count({ where: failedEmailWhere }),
      prisma.tripApplication.count({ where: failedEmailWhere }),
      prisma.booking.count({ where: failedEmailWhere }),
    ]);

  const failedInbound = failedContacts + failedApplications;
  const failedEmails = failedInbound + failedBookings;

  const cards = [
    {
      title: t("navTrips"),
      value: tripCount,
      href: "/admin/trips",
      cta: t("manageTrips"),
      hint: null,
    },
    {
      title: t("navBookings"),
      value: bookingCount,
      href: "/admin/bookings",
      cta: t("manageBookings"),
      hint:
        unreadBookingCount > 0
          ? t("unreadCount", { count: unreadBookingCount })
          : null,
    },
    {
      title: t("navTeam"),
      value: teamCount,
      href: "/admin/team",
      cta: t("manageTeam"),
      hint: null,
    },
    {
      title: t("navTestimonials"),
      value: testimonialCount,
      href: "/admin/testimonials",
      cta: t("manageTestimonials"),
      hint: null,
    },
  ];

  return (
    <>
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        align="left"
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.href}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
            <p className="mt-2 font-display text-4xl font-bold text-slate-900">
              {card.value}
            </p>
            {card.hint ? (
              <p className="mt-1 text-sm font-medium text-amber-700">{card.hint}</p>
            ) : null}
            <Button href={card.href} size="sm" className="mt-4">
              {card.cta}
            </Button>
          </div>
        ))}
      </div>

      {failedEmails > 0 ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-display text-xl font-bold text-red-900">
            {t("emailFailedTitle")}
          </h2>
          <p className="mt-2 text-red-800">
            {t("emailFailedSummary", { count: failedEmails })}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {failedInbound > 0 ? (
              <Button href="/admin/inbound" size="sm">
                {t("emailFailedInbound", { count: failedInbound })}
              </Button>
            ) : null}
            {failedBookings > 0 ? (
              <Button href="/admin/bookings" size="sm" variant="outline">
                {t("emailFailedBookings", { count: failedBookings })}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-xl font-bold text-slate-900">
          {t("inboundTitle")}
        </h2>
        <p className="mt-2 text-slate-600">
          {t("inboundSummary", {
            contacts: contactCount,
            applications: applicationCount,
          })}
        </p>
        <Button href="/admin/inbound" size="sm" className="mt-4">
          {t("manageInbound")}
        </Button>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display text-xl font-bold text-slate-900">
          {t("settingsTitle")}
        </h2>
        <p className="mt-2 text-slate-600">{t("settingsDescription")}</p>
        <Button href="/admin/settings" size="sm" className="mt-4">
          {t("manageSettings")}
        </Button>
      </div>
    </>
  );
}
