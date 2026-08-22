-- AlterTable
ALTER TABLE "contact_message" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'hu';

-- AlterTable
ALTER TABLE "trip_application" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'hu';

-- AlterTable
ALTER TABLE "booking" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'hu';
