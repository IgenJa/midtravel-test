import "dotenv/config";
import { PrismaClient, type Difficulty, type Prisma } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { tripsEn } from "../src/data/trips/en";
import { tripsHu } from "../src/data/trips/hu";
import { moreTripsEn } from "../src/data/trips/more-en";
import { moreTripsHu } from "../src/data/trips/more-hu";
import { teamSeedEn, teamSeedHu } from "../src/data/team-seed";
import {
  testimonialsSeedEn,
  testimonialsSeedHu,
} from "../src/data/testimonials-seed";
import { COMPANY, COMPANY_SETTING_KEYS } from "../src/data/company";
import type { Trip } from "../src/types";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const force = process.argv.includes("--force");
const teamOnly = process.argv.includes("--team");

function toDates(dates: string[]): Date[] {
  return dates.map((value) => new Date(`${value}T12:00:00.000Z`));
}

function translationData(trip: Trip, locale: string) {
  return {
    locale,
    title: trip.title,
    country: trip.country,
    meetingPoint: trip.meetingPoint,
    shortDescription: trip.shortDescription,
    description: trip.description,
    program: trip.program as unknown as Prisma.InputJsonValue,
    included: trip.included,
    notIncluded: trip.notIncluded,
    faq: trip.faq as unknown as Prisma.InputJsonValue,
  };
}

async function seedAdmin() {
  const email = (
    process.env.SEED_ADMIN_EMAIL ?? "admin@midtravel.hu"
  ).toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMeNow!23";
  const name = process.env.SEED_ADMIN_NAME ?? "MidTravel Admin";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "admin", name, phone: existing.phone, emailVerified: true },
    });
    console.log(`Updated existing admin user: ${email}`);
    return;
  }

  const userId = crypto.randomUUID();
  const hashed = await hashPassword(password);

  await prisma.user.create({
    data: {
      id: userId,
      name,
      email,
      emailVerified: true,
      role: "admin",
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: userId,
          providerId: "credential",
          password: hashed,
        },
      },
    },
  });

  console.log(`Created admin user: ${email}`);
}

async function seedTrips() {
  const enAll = [...tripsEn, ...moreTripsEn];
  const huBySlug = new Map(
    [...tripsHu, ...moreTripsHu].map((trip) => [trip.slug, trip])
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const en of enAll) {
    const hu = huBySlug.get(en.slug) ?? en;
    const difficulty = en.difficulty as Difficulty;

    const existing = await prisma.trip.findUnique({
      where: { slug: en.slug },
      select: { id: true },
    });

    const shared = {
      price: en.price,
      duration: en.duration,
      heroImage: en.heroImage,
      gallery: en.gallery,
      difficulty,
      departureDates: toDates(en.departureDates),
      featured: Boolean(en.featured),
      published: true,
    };

    if (existing && !force) {
      skipped += 1;
      continue;
    }

    if (existing) {
      await prisma.trip.update({
        where: { id: existing.id },
        data: {
          ...shared,
          translations: {
            deleteMany: {},
            create: [translationData(hu, "hu"), translationData(en, "en")],
          },
        },
      });
      updated += 1;
      continue;
    }

    await prisma.trip.create({
      data: {
        slug: en.slug,
        ...shared,
        translations: {
          create: [translationData(hu, "hu"), translationData(en, "en")],
        },
      },
    });
    created += 1;
  }

  console.log(
    `Trips: created ${created}, updated ${updated}, skipped ${skipped}` +
      (skipped > 0 && !force ? " (existing rows kept; --force to overwrite)" : "")
  );
}

async function seedIfEmpty<T>({
  label,
  items,
  count,
  insert,
}: {
  label: string;
  items: T[];
  count: () => Promise<number>;
  insert: (items: T[]) => Promise<void>;
}) {
  const existing = await count();

  if (existing > 0 && !force) {
    console.log(
      `${label}: skipped ${existing} existing row(s) (use --force to replace)`
    );
    return;
  }

  if (existing > 0 && items.length === 0) {
    console.log(
      `${label}: seed source is empty — left ${existing} existing row(s) in place`
    );
    return;
  }

  if (existing > 0) {
    await insert(items);
    console.log(`${label}: replaced ${existing} row(s) with ${items.length} from seed`);
    return;
  }

  if (items.length === 0) {
    console.log(`${label}: nothing to insert`);
    return;
  }

  await insert(items);
  console.log(`${label}: created ${items.length}`);
}

async function seedCompanySettings() {
  const defaults: Record<string, string> = {
    [COMPANY_SETTING_KEYS.legalName]: COMPANY.legalName,
    [COMPANY_SETTING_KEYS.legalNameShort]: COMPANY.legalNameShort,
    [COMPANY_SETTING_KEYS.email]: COMPANY.email,
    [COMPANY_SETTING_KEYS.phone]: COMPANY.phone,
    [COMPANY_SETTING_KEYS.taxId]: COMPANY.taxId,
    [COMPANY_SETTING_KEYS.companyRegistryNumber]: COMPANY.companyRegistryNumber,
    [COMPANY_SETTING_KEYS.streetAddress]: COMPANY.streetAddress,
    [COMPANY_SETTING_KEYS.postalCode]: COMPANY.postalCode,
    [COMPANY_SETTING_KEYS.city]: COMPANY.city,
    [COMPANY_SETTING_KEYS.addressCountry]: COMPANY.addressCountry,
    [COMPANY_SETTING_KEYS.facebook]: COMPANY.social.facebook,
  };

  let created = 0;
  let skipped = 0;

  for (const [key, value] of Object.entries(defaults)) {
    const existing = await prisma.siteSetting.findUnique({
      where: { key },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.siteSetting.create({ data: { key, value } });
    created += 1;
  }

  console.log(
    `Company settings: created ${created}, skipped ${skipped}` +
      (skipped > 0 ? " (existing admin values kept)" : "")
  );
}

async function seedTeam() {
  const huById = new Map(teamSeedHu.map((member) => [member.id, member]));

  await seedIfEmpty({
    label: "Team",
    items: teamSeedEn,
    count: () => prisma.teamMember.count(),
    insert: async (members) => {
      if (force) {
        await prisma.teamMember.deleteMany();
      }

      for (const [index, en] of members.entries()) {
        const hu = huById.get(en.id) ?? en;
        await prisma.teamMember.create({
          data: {
            name: en.name,
            positionHu: hu.position,
            positionEn: en.position,
            descriptionHu: hu.description,
            descriptionEn: en.description,
            photo: en.photo,
            linkedin: en.social.linkedin ?? null,
            instagram: en.social.instagram ?? null,
            email: en.social.email ?? null,
            sortOrder: index,
            published: true,
          },
        });
      }
    },
  });
}

async function seedTestimonials() {
  const huById = new Map(
    testimonialsSeedHu.map((item) => [item.id, item])
  );

  await seedIfEmpty({
    label: "Testimonials",
    items: testimonialsSeedEn,
    count: () => prisma.testimonial.count(),
    insert: async (items) => {
      if (force) {
        await prisma.testimonial.deleteMany();
      }

      for (const [index, en] of items.entries()) {
        const hu = huById.get(en.id) ?? en;
        await prisma.testimonial.create({
          data: {
            name: en.name,
            locationHu: hu.location,
            locationEn: en.location,
            textHu: hu.text,
            textEn: en.text,
            rating: en.rating,
            avatar: en.avatar,
            sortOrder: index,
            published: true,
          },
        });
      }
    },
  });
}

async function main() {
  if (force) {
    console.log("Seed running with --force (will overwrite catalog content)");
  }

  if (!teamOnly) {
    await seedAdmin();
    await seedTrips();
  }

  await seedTeam();
  await seedTestimonials();
  await seedCompanySettings();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
