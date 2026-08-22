import type { Locale } from "@/i18n/routing";

export const COMPANY = {
  name: "MidTravel",
  legalName: "Mid Travel Betéti Társaság",
  legalNameShort: "MID Travel Bt.",
  email: "midtravel2019@gmail.com",
  phone: "+36 20 431 2094",
  phoneHref: "+36204312094",
  taxId: "26652085-2-06",
  companyRegistryNumber: "06-06-017035",
  streetAddress: "Délceg utca 11.",
  postalCode: "6727",
  city: "Szeged",
  addressCountry: "HU",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=100045433491781",
  },
  foundedYear: 2019,
  foundedDate: "2019-02-12",
} as const;

interface CompanyContent {
  tagline: string;
  description: string;
  registryCourt: string;
  businessHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  stats: { value: string; label: string }[];
  whyChooseUs: {
    title: string;
    description: string;
    icon: string;
  }[];
  footerTagline: string;
  about: {
    mission: string;
    vision: string;
    story: string[];
    values: { title: string; description: string }[];
  };
}

const companyContent: Record<Locale, CompanyContent> = {
  hu: {
    tagline: "Fedezd fel a világot magabiztosan",
    description:
      "A MID Travel szegedi családi utazási iroda. 2019 óta szervezünk utakat; csapatunkban évtizedes idegenvezetői és turisztikai oktatói tapasztalat van.",
    registryCourt: "Szegedi Törvényszék Cégbírósága",
    businessHours: {
      weekdays: "H – P: 9:00 – 18:00",
      saturday: "Szo: 10:00 – 14:00",
      sunday: "V: Zárva",
    },
    stats: [
      { value: "2019", label: "Alapítás" },
      { value: "35+", label: "Év tapasztalat" },
      { value: "3", label: "Csapattag" },
      { value: "Szeged", label: "Családi iroda" },
    ],
    whyChooseUs: [
      {
        title: "Saját idegenvezetőink",
        description:
          "Az utakat a MID Travel képesített idegenvezetői kísérik — pedagógusok, idegenforgalmi szakemberek, Kölcsey-emlékérmes vezető.",
        icon: "compass",
      },
      {
        title: "Családi iroda Szegedről",
        description:
          "A Mihály család tervezi és szervezi az utakat. Személyes figyelem, nem tömegturizmus.",
        icon: "sparkles",
      },
      {
        title: "Oktatói háttér",
        description:
          "Csapatunk évtizedek óta tanít turizmust a Szegedi Tudományegyetemen és más intézményekben.",
        icon: "graduation",
      },
      {
        title: "Átlátható ajánlatok",
        description:
          "Világos árak, rejtett költségek nélkül — azt kapod, amiben megállapodtunk.",
        icon: "badge",
      },
    ],
    footerTagline: "Felejthetetlen utazások szervezése 2019 óta.",
    about: {
      mission:
        "Célunk, hogy minden utazó számára hiteles, inspiráló és gondtalan élményt nyújtsunk — olyan utazásokat, amelyek életre szóló emlékekké válnak.",
      vision:
        "Szegedről indított, megbízható családi utazási irodaként kísérni vendégeinket — saját idegenvezetőinkkel és személyes figyelemmel.",
      story: [
        "A MID Travel 2019-ben indult Szegeden, a Mihály család utazásszervező irodájaként. Ügyvezetőnk Mihály Péter, idegenforgalmi geográfus és egyetemi oktató; irodavezetőnk Mihály Illés, Kölcsey-emlékérmes idegenvezető, aki 2002–2012 között a Szeged és Térsége Turisztikai Nonprofit Kft. ügyvezetője volt.",
        "Csapatunkban képesített idegenvezetők és utazásszervezők dolgoznak, akik évtizedek óta tanítanak turizmust a Szegedi Tudományegyetemen és más intézményekben. Minden útitervet magunk állítunk össze, az utakat pedig saját vezetőink kísérik.",
        "A lényeg azóta sem változott: személyes figyelem, helyi szakértelem, és olyan utazások, amelyeket magunk is szívesen megtennénk.",
      ],
      values: [
        {
          title: "Hitelesség",
          description: "Valódi helyi élményeket kínálunk, nem turistacsapdákat.",
        },
        {
          title: "Személyesség",
          description: "Minden utazó egyedi igényeire szabjuk az élményt.",
        },
        {
          title: "Minőség",
          description: "Csak olyan szállásokat és partnereket választunk, amelyekben mi is megszállnánk.",
        },
        {
          title: "Felelősség",
          description: "Fenntartható turizmust támogatunk és tiszteletben tartjuk a helyi közösségeket.",
        },
      ],
    },
  },
  en: {
    tagline: "Discover the world with confidence",
    description:
      "MID Travel is a family-run travel agency in Szeged. We have been organizing trips since 2019, with decades of tour-guiding and tourism-teaching experience in the team.",
    registryCourt: "Company Registry of the Szeged Regional Court",
    businessHours: {
      weekdays: "Mon – Fri: 9:00 AM – 6:00 PM",
      saturday: "Sat: 10:00 AM – 2:00 PM",
      sunday: "Sun: Closed",
    },
    stats: [
      { value: "2019", label: "Founded" },
      { value: "35+", label: "Years of experience" },
      { value: "3", label: "Team members" },
      { value: "Szeged", label: "Family agency" },
    ],
    whyChooseUs: [
      {
        title: "Our own tour guides",
        description:
          "MID Travel’s licensed guides accompany the trips — teachers, tourism professionals, and a Kölcsey Medal-winning leader.",
        icon: "compass",
      },
      {
        title: "A family agency from Szeged",
        description:
          "The Mihály family plans and organizes every journey. Personal attention, not mass tourism.",
        icon: "sparkles",
      },
      {
        title: "Teaching background",
        description:
          "Our team has taught tourism for decades at the University of Szeged and other institutions.",
        icon: "graduation",
      },
      {
        title: "Transparent offers",
        description:
          "Clear prices, no hidden fees — you get what we agreed on.",
        icon: "badge",
      },
    ],
    footerTagline: "Crafting unforgettable journeys since 2019.",
    about: {
      mission:
        "Our mission is to deliver authentic, inspiring, and worry-free travel experiences that become lifelong memories.",
      vision:
        "To accompany our guests as a trusted family travel agency from Szeged — with our own guides and personal attention.",
      story: [
        "MID Travel started in Szeged in 2019 as the Mihály family’s tour operator. Managing director Mihály Péter is a tourism geographer and university lecturer; office manager Mihály Illés is a Kölcsey Medal-winning tour guide who served as managing director of Szeged és Térsége Turisztikai Nonprofit Kft. from 2002 to 2012.",
        "Our team are licensed tour guides and travel organizers who have taught tourism for decades at the University of Szeged and other institutions. We design every itinerary ourselves and accompany the trips with our own guides.",
        "The essence has not changed: personal attention, local expertise, and journeys we would gladly take ourselves.",
      ],
      values: [
        {
          title: "Authenticity",
          description: "We offer genuine local experiences, not tourist traps.",
        },
        {
          title: "Personal Touch",
          description: "Every journey is tailored to the unique needs of each traveler.",
        },
        {
          title: "Quality",
          description: "We only choose accommodations and partners we'd stay with ourselves.",
        },
        {
          title: "Responsibility",
          description: "We support sustainable tourism and respect local communities.",
        },
      ],
    },
  },
};

export const COMPANY_SETTING_KEYS = {
  legalName: "company.legalName",
  legalNameShort: "company.legalNameShort",
  email: "company.email",
  phone: "company.phone",
  taxId: "company.taxId",
  companyRegistryNumber: "company.companyRegistryNumber",
  streetAddress: "company.streetAddress",
  postalCode: "company.postalCode",
  city: "company.city",
  addressCountry: "company.addressCountry",
  facebook: "company.facebook",
} as const;

export type CompanyFactOverrides = Partial<{
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
}>;

export function toPhoneHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00")) return `+${cleaned.slice(2)}`;
  return cleaned ? `+${cleaned}` : phone.trim();
}

function formatAddress(
  locale: Locale,
  facts: { postalCode: string; city: string; streetAddress: string }
) {
  const { postalCode, city, streetAddress } = facts;
  return locale === "hu"
    ? `${postalCode} ${city}, ${streetAddress}`
    : `${streetAddress}, ${postalCode} ${city}, Hungary`;
}

export function getCompany(locale: Locale, overrides: CompanyFactOverrides = {}) {
  const facts = {
    ...COMPANY,
    ...overrides,
    phoneHref: toPhoneHref(overrides.phone ?? COMPANY.phone),
    social: {
      facebook: overrides.facebook ?? COMPANY.social.facebook,
    },
  };

  return {
    ...facts,
    ...companyContent[locale],
    address: formatAddress(locale, facts),
  };
}
