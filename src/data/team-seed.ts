import type { TeamMember } from "@/types";

const placeholderPhoto = "/profile-placeholder.svg";

const illesHu = `Kölcsey-emlékérmes idegenvezető.

Végzettségek:
• Pedagógia-földrajz szakos tanár, SZTE JGYPK
• Orosz nyelvtanár, SZTE JGYPK
• Könyvtár szak, SZTE JGYPK
• Idegenvezető, KIT Kft.
• Turisztikai szakmenedzser, KIT Kft.

2002–2012 Szeged és Térsége Turisztikai Nonprofit Kft. ügyvezető igazgatója
1989–2021 Turisztikai oktató: Szegedi Tudományegyetem, School of Business, SZEFI, MIOK, Krúdy Gyula Szakképző Iskola, Szent Benedek Gimnázium, KIT Kft.`;

const illesEn = `Kölcsey Medal-winning tour guide.

Qualifications:
• Teacher of Pedagogy and Geography, University of Szeged JGYPK
• Teacher of Russian, University of Szeged JGYPK
• Library Studies, University of Szeged JGYPK
• Tour Guide, KIT Ltd.
• Tourism Manager, KIT Ltd.

2002–2012 Managing Director of Szeged és Térsége Turisztikai Nonprofit Kft.
1989–2021 Tourism instructor: University of Szeged, School of Business, SZEFI, MIOK, Krúdy Gyula Vocational School, Szent Benedek High School, KIT Ltd.`;

const peterHu = `Végzettségek:
• Idegenforgalmi geográfus, SZTE TTIK
• Pedagógia, SZTE JGYPK
• Közoktatás vezető, SZTE JGYPK
• Idegenvezető és szakmenedzser, KIT Kft.
• Falusi vendéglátó, KIT Kft.
• SZTE TTIK doktori iskola

2007–2021 Egyetemi oktató, főiskolai adjunktus
Turisztikai oktató: Szegedi Tudományegyetem, School of Business, SZEFI, MIOK, Krúdy Gyula Szakképző Iskola, Szent Benedek Gimnázium, KIT Kft.`;

const peterEn = `Qualifications:
• Tourism geographer, University of Szeged TTIK
• Pedagogy, University of Szeged JGYPK
• Public Education Leader, University of Szeged JGYPK
• Tour Guide and Tourism Manager, KIT Ltd.
• Rural Hospitality, KIT Ltd.
• University of Szeged TTIK Doctoral School

2007–2021 University lecturer, college assistant professor
Tourism instructor: University of Szeged, School of Business, SZEFI, MIOK, Krúdy Gyula Vocational School, Szent Benedek High School, KIT Ltd.`;

const orsolyaHu = `Végzettségek:
• Olasz nyelv és irodalom szakos tanár, SZTE JGYPK
• Rajz szakos tanár, SZTE JGYPK
• Vizuális- és Környezetkultúra tanár, SZTE JGYPK
• Idegenvezető és hostess, KIT Kft.
• 3-szor magyar bajnok sminkben (2015)
• Turisztikai oktató: MIOK`;

const orsolyaEn = `Qualifications:
• Teacher of Italian Language and Literature, University of Szeged JGYPK
• Teacher of Drawing, University of Szeged JGYPK
• Teacher of Visual and Environmental Culture, University of Szeged JGYPK
• Tour Guide and Hostess, KIT Ltd.
• 3-time Hungarian makeup champion (2015)
• Tourism instructor: MIOK`;

/** Static seed source — runtime reads come from Prisma via `@/lib/content/team`. */
export const teamSeedEn: TeamMember[] = [
  {
    id: "1",
    name: "Mihály Illés",
    position: "Office Manager, MID Travel",
    description: illesEn,
    photo: placeholderPhoto,
    social: {},
  },
  {
    id: "2",
    name: "Mihály Péter",
    position: "Managing Director, MID Travel",
    description: peterEn,
    photo: placeholderPhoto,
    social: {},
  },
  {
    id: "3",
    name: "Mihály Orsolya Éva",
    position: "Tour Guide and Travel Organizer",
    description: orsolyaEn,
    photo: placeholderPhoto,
    social: {},
  },
];

export const teamSeedHu: TeamMember[] = [
  {
    id: "1",
    name: "Mihály Illés",
    position: "MID Travel irodavezetője",
    description: illesHu,
    photo: placeholderPhoto,
    social: {},
  },
  {
    id: "2",
    name: "Mihály Péter",
    position: "MID Travel ügyvezetője",
    description: peterHu,
    photo: placeholderPhoto,
    social: {},
  },
  {
    id: "3",
    name: "Mihály Orsolya Éva",
    position: "Idegenvezető és utazásszervező",
    description: orsolyaHu,
    photo: placeholderPhoto,
    social: {},
  },
];
