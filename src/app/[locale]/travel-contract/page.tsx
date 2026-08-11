import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { createMetadata } from "@/lib/seo";
import { getCompany } from "@/data/company";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("contractTitle"),
    description: t("contractDescription"),
    path: "/travel-contract",
    locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function TravelContractPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contract");
  const company = getCompany(locale);
  const isHu = locale === "hu";

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h1 className="font-display text-4xl font-bold text-slate-900">
            {t("title")}
          </h1>
          <p className="mt-4 text-slate-500">{t("lastUpdated")}</p>

          <div className="prose prose-slate mt-12 max-w-none space-y-8 text-slate-600">
            {isHu ? (
              <>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">1. Szerződés létrejötte</h2>
                  <p className="mt-4 leading-relaxed">
                    A kötelező érvényű utazási szerződés az utazó és a {company.name} között a foglalás
                    visszaigazolásakor és az előleg vagy teljes díj megfizetésekor jön létre.
                  </p>
                </section>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">2. Foglalás és fizetés</h2>
                  <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>A teljes díj 30%-a előlegként fizetendő a foglalás biztosításához.</li>
                    <li>A fennmaradó összeg indulás előtt 45 nappal esedékes.</li>
                    <li>Az árak EUR-ban értendők, ha másként nem jelezzük.</li>
                  </ul>
                </section>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">3. Lemondási feltételek</h2>
                  <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>60+ nappal indulás előtt: teljes visszatérítés, 50 € adminisztrációs díjjal</li>
                    <li>30–60 nap: 50% visszatérítés</li>
                    <li>15–29 nap: 25% visszatérítés</li>
                    <li>15 nap alatt: nincs visszatérítés</li>
                  </ul>
                </section>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">4. Kapcsolat</h2>
                  <p className="mt-4 leading-relaxed">
                    Kérdéseiddel fordulj hozzánk:{" "}
                    <a href={`mailto:${company.email}`} className="text-teal-600 hover:underline">
                      {company.email}
                    </a>{" "}
                    vagy telefonon:{" "}
                    <a href={`tel:${company.phone}`} className="text-teal-600 hover:underline">
                      {company.phone}
                    </a>
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">1. Contract Formation</h2>
                  <p className="mt-4 leading-relaxed">
                    A binding travel contract between you and {company.name} is formed upon confirmation
                    of your booking and receipt of the required deposit or full payment.
                  </p>
                </section>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">2. Booking and Payment</h2>
                  <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>A deposit of 30% of the total trip price is required to secure your booking.</li>
                    <li>The remaining balance is due 45 days before the departure date.</li>
                    <li>All prices are quoted in EUR unless otherwise stated.</li>
                  </ul>
                </section>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">3. Cancellation Policy</h2>
                  <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>More than 60 days before departure: full refund minus €50 administrative fee</li>
                    <li>30–60 days: 50% refund</li>
                    <li>15–29 days: 25% refund</li>
                    <li>Less than 15 days: no refund</li>
                  </ul>
                </section>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">4. Contact</h2>
                  <p className="mt-4 leading-relaxed">
                    For questions regarding this contract, contact us at{" "}
                    <a href={`mailto:${company.email}`} className="text-teal-600 hover:underline">
                      {company.email}
                    </a>{" "}
                    or call{" "}
                    <a href={`tel:${company.phone}`} className="text-teal-600 hover:underline">
                      {company.phone}
                    </a>
                  </p>
                </section>
              </>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
