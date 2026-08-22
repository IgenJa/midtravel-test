import type { Trip } from "@/types";
import { tripStockImage } from "./images";

export const tripsEn: Trip[] = [
  {
    id: "1",
    slug: "italy",
    title: "Italian Riviera & Tuscany",
    country: "Italy",
    price: 1890,
    duration: 8,
    featured: true,
    shortDescription:
      "From the colorful coast of Cinque Terre to the rolling hills of Tuscany — experience la dolce vita.",
    description:
      "Embark on an unforgettable journey through Italy's most enchanting regions. Wander through medieval villages perched on cliffs, savor world-class cuisine in Florence, and watch the sunset over vineyards in Chianti. This carefully curated tour blends iconic landmarks with hidden gems, giving you an authentic taste of Italian culture, art, and lifestyle.",
    heroImage: tripStockImage("italy"),
    gallery: [tripStockImage("italy")],
    program: [
      {
        day: 1,
        title: "Arrival in Milan",
        description:
          "Welcome to Italy! Transfer to your hotel, evening welcome dinner with your travel group.",
      },
      {
        day: 2,
        title: "Cinque Terre",
        description:
          "Explore the five colorful fishing villages connected by scenic hiking trails and coastal views.",
      },
      {
        day: 3,
        title: "Portofino & Genoa",
        description:
          "Visit the glamorous harbor of Portofino and discover Genoa's historic old town.",
      },
      {
        day: 4,
        title: "Florence",
        description:
          "Guided tour of the Uffizi Gallery, Ponte Vecchio, and the magnificent Duomo.",
      },
      {
        day: 5,
        title: "Tuscany Wine Country",
        description:
          "Wine tasting in Chianti, lunch at a family-run vineyard, and sunset in San Gimignano.",
      },
      {
        day: 6,
        title: "Siena & Pisa",
        description:
          "Medieval Siena's Piazza del Campo and the iconic Leaning Tower of Pisa.",
      },
      {
        day: 7,
        title: "Free Day in Florence",
        description:
          "Explore at your own pace — shopping, museums, or a cooking class (optional).",
      },
      {
        day: 8,
        title: "Departure",
        description: "Breakfast and transfer to the airport. Arrivederci, Italia!",
      },
    ],
    included: [
      "7 nights in 4-star hotels",
      "Daily breakfast and 4 dinners",
      "All guided tours and entrance fees",
      "Private air-conditioned coach",
      "Professional English-speaking guide",
      "Wine tasting experience",
    ],
    notIncluded: [
      "International flights",
      "Travel insurance",
      "Personal expenses",
      "Optional activities",
      "Tips for guides and drivers",
    ],
    departureDates: ["2026-05-15", "2026-06-12", "2026-09-08", "2026-10-03"],
    meetingPoint: "Milan Malpensa Airport, Terminal 1, Arrivals Hall",
    difficulty: "Easy",
    faq: [
      {
        question: "What is the group size?",
        answer:
          "Our groups are limited to 16 travelers to ensure a personal experience and comfortable travel.",
      },
      {
        question: "Is this trip suitable for solo travelers?",
        answer:
          "Absolutely! About 40% of our travelers join solo. We foster a friendly, inclusive group atmosphere.",
      },
      {
        question: "What fitness level is required?",
        answer:
          "This is an easy-paced trip with moderate walking. Comfortable shoes are recommended for cobblestone streets.",
      },
    ],
  },
  {
    id: "2",
    slug: "croatia",
    title: "Croatian Coast Adventure",
    country: "Croatia",
    price: 1450,
    duration: 7,
    featured: true,
    shortDescription:
      "Crystal-clear Adriatic waters, ancient walled cities, and sun-drenched islands await.",
    description:
      "Discover the breathtaking beauty of Croatia's Dalmatian coast. Sail between idyllic islands, walk the marble streets of Dubrovnik's Old Town, and swim in hidden coves accessible only by boat. This adventure combines cultural exploration with outdoor activities, perfect for travelers who want both relaxation and discovery.",
    heroImage: tripStockImage("croatia"),
    gallery: [tripStockImage("croatia")],
    program: [
      {
        day: 1,
        title: "Arrival in Split",
        description:
          "Check into your boutique hotel in the heart of Diocletian's Palace. Evening stroll along the Riva.",
      },
      {
        day: 2,
        title: "Split & Trogir",
        description:
          "Guided tour of Split's ancient palace and UNESCO-listed Trogir old town.",
      },
      {
        day: 3,
        title: "Hvar Island",
        description:
          "Ferry to Hvar — lavender fields, hilltop fortress, and beach time at Pakleni Islands.",
      },
      {
        day: 4,
        title: "Brač Island",
        description:
          "Visit the famous Zlatni Rat beach and explore the stone masonry village of Škrip.",
      },
      {
        day: 5,
        title: "Dubrovnik",
        description:
          "Walk the city walls, explore the Old Town, and enjoy a sunset cable car ride.",
      },
      {
        day: 6,
        title: "Elafiti Islands Cruise",
        description:
          "Full-day boat trip with swimming, snorkeling, and a seafood lunch on board.",
      },
      {
        day: 7,
        title: "Departure",
        description: "Morning at leisure before transfer to Dubrovnik Airport.",
      },
    ],
    included: [
      "6 nights in boutique hotels",
      "Daily breakfast and 3 dinners",
      "Island ferry tickets",
      "Elafiti Islands boat cruise",
      "All guided walking tours",
      "Airport transfers",
    ],
    notIncluded: [
      "International flights",
      "Travel insurance",
      "Lunch on free days",
      "Water sports activities",
      "Tips and gratuities",
    ],
    departureDates: ["2026-06-01", "2026-07-06", "2026-08-10", "2026-09-14"],
    meetingPoint: "Split Airport, Main Arrivals Hall",
    difficulty: "Moderate",
    faq: [
      {
        question: "Do I need to know how to swim?",
        answer:
          "Swimming is not required, but you'll have opportunities to swim and snorkel. Life jackets are provided on boat trips.",
      },
      {
        question: "What should I pack?",
        answer:
          "Light clothing, swimwear, sun protection, comfortable walking shoes, and a light jacket for evenings.",
      },
      {
        question: "Are meals included?",
        answer:
          "Breakfast is included daily. Three group dinners are included; lunches are at your own expense.",
      },
    ],
  },
  {
    id: "3",
    slug: "spain",
    title: "Spain: Barcelona to Andalusia",
    country: "Spain",
    price: 1690,
    duration: 9,
    featured: true,
    shortDescription:
      "Gaudí's masterpieces, flamenco nights, and the soul of southern Spain in one epic journey.",
    description:
      "From the avant-garde architecture of Barcelona to the passionate rhythms of Seville, this tour captures the essence of Spain. Marvel at Gaudí's Sagrada Familia, taste tapas in Madrid's hidden bars, and explore the Alhambra's Moorish splendor. A perfect blend of art, history, gastronomy, and vibrant local culture.",
    heroImage: tripStockImage("spain"),
    gallery: [tripStockImage("spain")],
    program: [
      {
        day: 1,
        title: "Arrival in Barcelona",
        description:
          "Transfer to hotel in Eixample district. Evening tapas tour through the Gothic Quarter.",
      },
      {
        day: 2,
        title: "Barcelona Highlights",
        description:
          "Sagrada Familia, Park Güell, and a stroll down Las Ramblas with your expert guide.",
      },
      {
        day: 3,
        title: "Barcelona to Madrid",
        description:
          "High-speed train to Madrid. Afternoon visit to the Prado Museum and Retiro Park.",
      },
      {
        day: 4,
        title: "Madrid",
        description:
          "Royal Palace tour, Mercado de San Miguel, and an evening flamenco show.",
      },
      {
        day: 5,
        title: "Toledo Day Trip",
        description:
          "Medieval Toledo — cathedral, synagogues, and sword-making workshops.",
      },
      {
        day: 6,
        title: "Madrid to Seville",
        description:
          "Train to Andalusia. Evening walk through the Santa Cruz quarter.",
      },
      {
        day: 7,
        title: "Seville & Granada",
        description:
          "Seville Cathedral and Alcázar, then transfer to Granada for the evening.",
      },
      {
        day: 8,
        title: "The Alhambra",
        description:
          "Full guided tour of the Alhambra palace and Generalife gardens.",
      },
      {
        day: 9,
        title: "Departure",
        description: "Transfer to Granada or Málaga Airport.",
      },
    ],
    included: [
      "8 nights in centrally located hotels",
      "Daily breakfast and 5 dinners",
      "High-speed train tickets",
      "All museum and monument entrance fees",
      "Flamenco show in Madrid",
      "Professional guide throughout",
    ],
    notIncluded: [
      "International flights",
      "Travel insurance",
      "Lunch meals",
      "Optional excursions",
      "Personal shopping",
    ],
    departureDates: ["2026-04-20", "2026-05-25", "2026-09-01", "2026-10-15"],
    meetingPoint: "Barcelona El Prat Airport, Terminal 1",
    difficulty: "Easy",
    faq: [
      {
        question: "Will we have free time?",
        answer:
          "Yes, each city includes free time for personal exploration, shopping, and dining at your own pace.",
      },
      {
        question: "Is the Alhambra ticket guaranteed?",
        answer:
          "We secure Alhambra tickets months in advance as part of your booking — no need to worry about availability.",
      },
      {
        question: "What languages are tours conducted in?",
        answer:
          "All tours are conducted in English. Local guides in each city may also speak Spanish and other languages.",
      },
    ],
  },
];
