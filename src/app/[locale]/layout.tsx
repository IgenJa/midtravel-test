import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { routing, type Locale } from "@/i18n/routing";
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd } from "@/lib/json-ld";
import { createMetadata } from "@/lib/seo";
import "../globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return createMetadata({
    title: t("homeTitle"),
    description: t("homeDescription"),
    path: "",
    locale: locale as Locale,
    siteTagline: t("siteTagline"),
  });
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <JsonLd data={await organizationJsonLd(locale as Locale)} />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsentBanner
              enabled={Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN)}
            />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
