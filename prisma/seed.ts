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
import type { Trip } from "../src/types";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

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
      data: { role: "admin", name, phone: existing.phone },
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

  let upserted = 0;

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
    } else {
      await prisma.trip.create({
        data: {
          slug: en.slug,
          ...shared,
          translations: {
            create: [translationData(hu, "hu"), translationData(en, "en")],
          },
        },
      });
    }

    upserted += 1;
  }

  console.log(`Seeded ${upserted} trips`);
}

async function seedTeam() {
  const huById = new Map(teamSeedHu.map((member) => [member.id, member]));

  await prisma.teamMember.deleteMany();

  for (const [index, en] of teamSeedEn.entries()) {
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

  console.log(`Seeded ${teamSeedEn.length} team members`);
}

async function seedTestimonials() {
  const huById = new Map(
    testimonialsSeedHu.map((item) => [item.id, item])
  );

  await prisma.testimonial.deleteMany();

  for (const [index, en] of testimonialsSeedEn.entries()) {
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

  console.log(`Seeded ${testimonialsSeedEn.length} testimonials`);
}

async function main() {
  await seedAdmin();
  await seedTrips();
  await seedTeam();
  await seedTestimonials();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
