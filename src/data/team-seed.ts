import type { TeamMember } from "@/types";

/** Static seed source — runtime reads come from Prisma via `@/lib/content/team`. */
export const teamSeedEn: TeamMember[] = [
  {
    id: "1",
    name: "Ana Kovač",
    position: "Founder & CEO",
    description:
      "With 20 years in the travel industry, Ana founded MidTravel with a vision to make premium travel accessible. She has personally visited over 60 countries and curates every itinerary.",
    photo: "/profile-placeholder.svg",
    social: {
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      email: "ana@midtravel.com",
    },
  },
  {
    id: "2",
    name: "Marko Novak",
    position: "Head of Operations",
    description:
      "Marko ensures every trip runs seamlessly — from logistics to on-the-ground support. His attention to detail and calm problem-solving make him invaluable.",
    photo: "/profile-placeholder.svg",
    social: { linkedin: "https://linkedin.com", email: "marko@midtravel.com" },
  },
  {
    id: "3",
    name: "Elena Rossi",
    position: "Senior Travel Designer",
    description:
      "Elena specializes in Mediterranean destinations. Her deep knowledge of Italian and Croatian culture brings authenticity to every journey she designs.",
    photo: "/profile-placeholder.svg",
    social: {
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      email: "elena@midtravel.com",
    },
  },
  {
    id: "4",
    name: "David Chen",
    position: "Customer Experience Manager",
    description:
      "David leads our customer support team, ensuring every traveler feels cared for before, during, and after their trip. His warmth sets the tone for MidTravel.",
    photo: "/profile-placeholder.svg",
    social: { linkedin: "https://linkedin.com", email: "david@midtravel.com" },
  },
  {
    id: "5",
    name: "Sofia Martínez",
    position: "Marketing Director",
    description:
      "Sofia shares the stories behind our destinations through compelling content and partnerships. She believes travel should inspire and connect people.",
    photo: "/profile-placeholder.svg",
    social: {
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      email: "sofia@midtravel.com",
    },
  },
  {
    id: "6",
    name: "Luka Horvat",
    position: "Adventure Trip Leader",
    description:
      "A certified mountain guide and avid explorer, Luka leads our more active itineraries. His enthusiasm for the outdoors is contagious.",
    photo: "/profile-placeholder.svg",
    social: {
      instagram: "https://instagram.com",
      email: "luka@midtravel.com",
    },
  },
];

export const teamSeedHu: TeamMember[] = [
  {
    id: "1",
    name: "Ana Kovač",
    position: "Alapító és vezérigazgató",
    description:
      "20 év utazási ipari tapasztalattal Ana azzal a céllal alapította a MidTravelt, hogy a prémium utazás mindenki számára elérhető legyen. Személyesen több mint 60 országot járt be.",
    photo: "/profile-placeholder.svg",
    social: {
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      email: "ana@midtravel.com",
    },
  },
  {
    id: "2",
    name: "Marko Novak",
    position: "Operációs vezető",
    description:
      "Marko biztosítja, hogy minden utazás zökkenőmentesen menjen — a logisztikától a helyszíni támogatásig. Figyelme a részletekre felbecsülhetetlen.",
    photo: "/profile-placeholder.svg",
    social: { linkedin: "https://linkedin.com", email: "marko@midtravel.com" },
  },
  {
    id: "3",
    name: "Elena Rossi",
    position: "Vezető utazástervező",
    description:
      "Elena a mediterrán úti célok szakértője. Az olasz és horvát kultúra mély ismerete hitelességet ad minden általa tervezett útnak.",
    photo: "/profile-placeholder.svg",
    social: {
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      email: "elena@midtravel.com",
    },
  },
  {
    id: "4",
    name: "David Chen",
    position: "Ügyfélélmény menedzser",
    description:
      "David vezeti ügyfélszolgálati csapatunkat, gondoskodva arról, hogy minden utazó jól érezze magát az utazás előtt, közben és utána is.",
    photo: "/profile-placeholder.svg",
    social: { linkedin: "https://linkedin.com", email: "david@midtravel.com" },
  },
  {
    id: "5",
    name: "Sofia Martínez",
    position: "Marketing igazgató",
    description:
      "Sofia meggyőző tartalmakkal és partnerségekkel meséli el úti céljaink történeteit. Hiszi, hogy az utazás inspiráljon és összekössön embereket.",
    photo: "/profile-placeholder.svg",
    social: {
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      email: "sofia@midtravel.com",
    },
  },
  {
    id: "6",
    name: "Luka Horvat",
    position: "Kalandtúra vezető",
    description:
      "Minősített hegyi vezető és lelkes felfedező, Luka vezeti aktívabb útvonalainkat. Szabadtéri lelkesedése ragályos.",
    photo: "/profile-placeholder.svg",
    social: {
      instagram: "https://instagram.com",
      email: "luka@midtravel.com",
    },
  },
];
