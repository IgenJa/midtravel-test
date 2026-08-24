-- AlterTable
ALTER TABLE "trip_application" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);
ALTER TABLE "trip_application" ADD COLUMN "privacyDocVersion" TEXT;
ALTER TABLE "trip_application" ADD COLUMN "privacyDocSha256" TEXT;
ALTER TABLE "trip_application" ADD COLUMN "contractDocVersion" TEXT;
ALTER TABLE "trip_application" ADD COLUMN "contractDocSha256" TEXT;

-- AlterTable
ALTER TABLE "booking" ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);
ALTER TABLE "booking" ADD COLUMN "privacyDocVersion" TEXT;
ALTER TABLE "booking" ADD COLUMN "privacyDocSha256" TEXT;
ALTER TABLE "booking" ADD COLUMN "contractDocVersion" TEXT;
ALTER TABLE "booking" ADD COLUMN "contractDocSha256" TEXT;
