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
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    path: "/privacy-policy",
    locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("privacy");
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
                  <h2 className="font-display text-2xl font-bold text-slate-900">1. Bevezetés</h2>
                  <p className="mt-4 leading-relaxed">
                    A {company.name} elkötelezett személyes adataid védelme iránt. Ez az adatvédelmi irányelv
                    ismerteti, hogyan gyűjtjük, használjuk és védjük adataidat, amikor weboldalunkat látogatod
                    vagy szolgáltatásainkat igénybe veszed.
                  </p>
                </section>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">2. Gyűjtött adatok</h2>
                  <p className="mt-4 leading-relaxed">
                    Személyes adatokat gyűjtünk, amelyeket önként adsz meg regisztráció, jelentkezés
                    vagy kapcsolatfelvétel során — például nevet, e-mail címet, telefonszámot és utazási preferenciákat.
                  </p>
                </section>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">3. Kapcsolat</h2>
                  <p className="mt-4 leading-relaxed">
                    Kérdéseiddel fordulj hozzánk:{" "}
                    <a href={`mailto:${company.email}`} className="text-teal-600 hover:underline">
                      {company.email}
                    </a>
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">1. Introduction</h2>
                  <p className="mt-4 leading-relaxed">
                    {company.name} is committed to protecting your privacy. This Privacy Policy explains how we
                    collect, use, disclose, and safeguard your information when you visit our website or use our services.
                  </p>
                </section>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">2. Information We Collect</h2>
                  <p className="mt-4 leading-relaxed">
                    We may collect personal information you voluntarily provide when registering for a trip,
                    applying for a journey, or contacting us — including name, email, phone number, and travel preferences.
                  </p>
                </section>
                <section>
                  <h2 className="font-display text-2xl font-bold text-slate-900">3. Contact Us</h2>
                  <p className="mt-4 leading-relaxed">
                    If you have questions about this Privacy Policy, please contact us at{" "}
                    <a href={`mailto:${company.email}`} className="text-teal-600 hover:underline">
                      {company.email}
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
