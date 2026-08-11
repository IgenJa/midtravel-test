import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const contact = await prisma.contactMessage.create({
    data: {
      name: "Smoke Teszt",
      email: "smoke@example.com",
      subject: "Lokalis smoke",
      message: "Contact smoke teszt uzenet 12345",
    },
  });

  const trip = await prisma.trip.findFirstOrThrow({
    select: { id: true, slug: true },
  });

  const application = await prisma.tripApplication.create({
    data: {
      fullName: "Smoke Apply",
      email: "smoke-apply@example.com",
      phone: "+36301112233",
      participants: 2,
      tripSlug: trip.slug,
      tripId: trip.id,
      message: "Apply smoke",
      requestInsurance: false,
    },
  });

  console.log(
    JSON.stringify(
      {
        contactId: contact.id,
        applyId: application.id,
        trips: await prisma.trip.count(),
        users: await prisma.user.count(),
        contacts: await prisma.contactMessage.count(),
        applications: await prisma.tripApplication.count(),
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
