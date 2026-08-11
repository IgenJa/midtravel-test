import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
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

  const [tripCount, teamCount, testimonialCount, contactCount, applicationCount, bookingCount] =
    await Promise.all([
      prisma.trip.count(),
      prisma.teamMember.count(),
      prisma.testimonial.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.tripApplication.count({ where: { read: false } }),
      prisma.booking.count(),
    ]);

  const cards = [
    {
      title: t("navTrips"),
      value: tripCount,
      href: "/admin/trips",
      cta: t("manageTrips"),
    },
    {
      title: t("navBookings"),
      value: bookingCount,
      href: "/admin/bookings",
      cta: t("manageBookings"),
    },
    {
      title: t("navTeam"),
      value: teamCount,
      href: "/admin/team",
      cta: t("manageTeam"),
    },
    {
      title: t("navTestimonials"),
      value: testimonialCount,
      href: "/admin/testimonials",
      cta: t("manageTestimonials"),
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
            <Button href={card.href} size="sm" className="mt-4">
              {card.cta}
            </Button>
          </div>
        ))}
      </div>

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
      </div>
    </>
  );
}
