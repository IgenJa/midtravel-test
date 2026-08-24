-- CreateEnum
CREATE TYPE "TripApplicationStatus" AS ENUM ('open', 'converted', 'released');

-- AlterTable
ALTER TABLE "trip_application" ADD COLUMN "status" "TripApplicationStatus" NOT NULL DEFAULT 'open';
ALTER TABLE "trip_application" ADD COLUMN "bookingId" TEXT;

-- Link checkout-created applications from booking notes before other cleanup
UPDATE "trip_application" AS a
SET
  "status" = 'converted',
  "bookingId" = b.id,
  "read" = true
FROM "booking" AS b
WHERE a."bookingId" IS NULL
  AND b.notes LIKE '%Jelentkezés: ' || a.id || '%';

-- CreateIndex
CREATE UNIQUE INDEX "trip_application_bookingId_key" ON "trip_application"("bookingId");

-- CreateIndex
CREATE INDEX "trip_application_status_idx" ON "trip_application"("status");

-- CreateIndex
CREATE INDEX "trip_application_tripId_email_status_idx" ON "trip_application"("tripId", "email", "status");

-- Keep the newest remaining open inquiry when the same email applied twice
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "tripId", lower("email")
      ORDER BY "createdAt" DESC
    ) AS rn
  FROM "trip_application"
  WHERE "status" = 'open' AND "tripId" IS NOT NULL
)
UPDATE "trip_application"
SET "status" = 'released', "read" = true
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- One open inquiry per trip + email
CREATE UNIQUE INDEX "trip_application_one_open_per_email"
ON "trip_application" ("tripId", lower("email"))
WHERE "status" = 'open' AND "tripId" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "trip_application" ADD CONSTRAINT "trip_application_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
