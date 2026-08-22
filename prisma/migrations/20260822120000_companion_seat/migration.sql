-- AlterTable
ALTER TABLE "trip_application" ADD COLUMN "companionName" TEXT;
ALTER TABLE "trip_application" ADD COLUMN "companionPhone" TEXT;

-- AlterTable
ALTER TABLE "booking" ADD COLUMN "companionName" TEXT;
ALTER TABLE "booking" ADD COLUMN "companionPhone" TEXT;
