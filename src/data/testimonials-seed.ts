import type { Testimonial } from "@/types";

/** Static seed source — runtime reads come from Prisma via `@/lib/content/testimonials`. */
export const testimonialsSeedEn: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    location: "London, UK",
    text: "Our Italy trip was absolutely magical. Every detail was taken care of, and our guide made us feel like locals. Already planning our next adventure with MidTravel!",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    id: "2",
    name: "James O'Brien",
    location: "Dublin, Ireland",
    text: "The Croatian coast tour exceeded all expectations. Crystal-clear waters, stunning architecture, and a wonderful group of fellow travelers. Highly recommend!",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
  },
  {
    id: "3",
    name: "Maria Santos",
    location: "Lisbon, Portugal",
    text: "From booking to return, the experience was flawless. The Spain itinerary was perfectly paced — we saw so much without ever feeling rushed.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
  },
  {
    id: "4",
    name: "Thomas Weber",
    location: "Munich, Germany",
    text: "As a solo traveler, I was nervous at first. But MidTravel created such a welcoming atmosphere that I made friends for life. The support team was incredible.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
];

export const testimonialsSeedHu: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    location: "London, Egyesült Királyság",
    text: "Az olaszországi utunk teljesen varázslatos volt. Minden részletre odafigyeltek, az idegenvezetőnk pedig úgy éreztette velünk, mintha helyiek lennénk. Már tervezzük a következő MidTravel kalandunkat!",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    id: "2",
    name: "James O'Brien",
    location: "Dublin, Írország",
    text: "A horvát tengerparti túra minden várakozást felülmúlt. Kristálytiszta vizek, lenyűgöző építészet és csodálatos társaság. Mindenkinek ajánlom!",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
  },
  {
    id: "3",
    name: "Maria Santos",
    location: "Lisszabon, Portugália",
    text: "A foglalástól a hazatérésig minden tökéletes volt. A spanyol útiterv remekül volt ütemezve — rengeteget láttunk anélkül, hogy rohanós lett volna.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
  },
  {
    id: "4",
    name: "Thomas Weber",
    location: "München, Németország",
    text: "Egyedül utazóként eleinte ideges voltam. De a MidTravel olyan barátságos légkört teremtett, hogy életre szóló barátságokat kötöttem. A támogató csapat hihetetlen.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
];
