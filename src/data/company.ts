import type { Locale } from "@/i18n/routing";

interface CompanyContent {
  tagline: string;
  description: string;
  address: string;
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
      "A MidTravel prémium utazási iroda, amely felejthetetlen utazásokat szervez Európában és azon túl. Több mint 15 éves tapasztalattal ötvözzük a szakértői tervezést, a helyi ismereteket és a személyre szabott szolgáltatást.",
    address: "6720 Szeged, Magyarország",
    businessHours: {
      weekdays: "H – P: 9:00 – 18:00",
      saturday: "Szo: 10:00 – 14:00",
      sunday: "V: Zárva",
    },
    stats: [
      { value: "15+", label: "Év tapasztalat" },
      { value: "12 000+", label: "Elégedett utazó" },
      { value: "48", label: "Úti cél" },
      { value: "4.9", label: "Átlagos értékelés" },
    ],
    whyChooseUs: [
      {
        title: "Szakértő helyi idegenvezetők",
        description:
          "Gondosan válogatott idegenvezetőink insider tudással és szenvedéllyel keltik életre az úti célokat.",
        icon: "compass",
      },
      {
        title: "Válogatott, egyedi élmények",
        description:
          "Minden útitervet úgy alakítunk, hogy a kaland, a kultúra és a pihenés egyaránt helyet kapjon benne.",
        icon: "sparkles",
      },
      {
        title: "0–24 órás támogatás",
        description:
          "Utazz nyugodtan — csapatunk a nap 24 órájában elérhető, bárhol is járj az utazás alatt.",
        icon: "headphones",
      },
      {
        title: "Kiváló ár-érték arány",
        description:
          "Prémium minőség rejtett költségek nélkül — átlátható árakkal és korrekt ajánlatokkal.",
        icon: "badge",
      },
    ],
    footerTagline: "Felejthetetlen utazások szervezése 2010 óta.",
    about: {
      mission:
        "Célunk, hogy minden utazó számára hiteles, inspiráló és gondtalan élményt nyújtsunk — olyan utazásokat, amelyek életre szóló emlékekké válnak.",
      vision:
        "Európa vezető prémium utazási irodájává válni, ahol a személyre szabott szolgáltatás és a helyi autenticitus találkozik.",
      story: [
        "A MidTravel 2010-ben indult egy egyszerű felismeréssel: az utazásnak többnek kell lennie, mint látnivalók meglátogatása. Alapítóink saját tapasztalataiból indultak ki, és olyan utazásokat kezdtek szervezni, amelyek összekötik az embereket a helyi kultúrával.",
        "Az évek során több mint 12 000 elégedett utazót vezettünk végig Európa legszebb úti céljain. Minden útitervet személyesen tervezünk, minden partnert gondosan válogatunk, és minden utazónak egyedi figyelmet biztosítunk.",
        "Ma már 48 úti célt kínálunk, de a lényeg változatlan maradt: hiszünk abban, hogy a legjobb utazások azok, amelyeket valódi szenvedéllyel és szakértelemmel terveznek.",
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
      "MidTravel is a premium travel agency crafting unforgettable journeys across Europe and beyond. With over 15 years of experience, we combine expert planning, local insights, and personalized service to deliver travel experiences that exceed expectations.",
    address: "6720 Szeged, Hungary",
    businessHours: {
      weekdays: "Mon – Fri: 9:00 AM – 6:00 PM",
      saturday: "Sat: 10:00 AM – 2:00 PM",
      sunday: "Sun: Closed",
    },
    stats: [
      { value: "15+", label: "Years of Experience" },
      { value: "12,000+", label: "Happy Travelers" },
      { value: "48", label: "Destinations" },
      { value: "4.9", label: "Average Rating" },
    ],
    whyChooseUs: [
      {
        title: "Expert Local Guides",
        description:
          "Our handpicked guides bring destinations to life with insider knowledge and genuine local passion.",
        icon: "compass",
      },
      {
        title: "Curated Experiences",
        description:
          "Every itinerary is thoughtfully designed to balance adventure, culture, and time to unwind.",
        icon: "sparkles",
      },
      {
        title: "24/7 Travel Support",
        description:
          "Travel with peace of mind knowing our team is available around the clock, wherever you go.",
        icon: "headphones",
      },
      {
        title: "Best Value Guarantee",
        description:
          "Premium quality without the premium price tag — transparent pricing and no hidden fees.",
        icon: "badge",
      },
    ],
    footerTagline: "Crafting unforgettable journeys since 2010.",
    about: {
      mission:
        "Our mission is to deliver authentic, inspiring, and worry-free travel experiences that become lifelong memories.",
      vision:
        "To become Europe's leading premium travel agency where personalized service meets local authenticity.",
      story: [
        "MidTravel was founded in 2010 with a simple belief: travel should be more than checking off landmarks. Our founders drew from their own journeys to create trips that connect people with local culture.",
        "Over the years, we've guided more than 12,000 happy travelers through Europe's most breathtaking destinations. Every itinerary is personally designed, every partner carefully selected, and every traveler receives individual attention.",
        "Today we offer 48 destinations, but our essence remains unchanged: we believe the best trips are those planned with genuine passion and expertise.",
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

export function getCompany(locale: Locale) {
  return {
    name: "MidTravel",
    email: "hello@midtravel.com",
    phone: "+36 62 555 1234",
    social: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      linkedin: "https://linkedin.com",
    },
    ...companyContent[locale],
  };
}
