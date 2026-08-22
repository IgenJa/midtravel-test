-- CreateEnum
CREATE TYPE "EmailSendStatus" AS ENUM ('pending', 'sent', 'failed');

-- AlterTable
ALTER TABLE "contact_message" ADD COLUMN "guestEmailStatus" "EmailSendStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "contact_message" ADD COLUMN "officeEmailStatus" "EmailSendStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "trip_application" ADD COLUMN "guestEmailStatus" "EmailSendStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "trip_application" ADD COLUMN "officeEmailStatus" "EmailSendStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "booking" ADD COLUMN "guestEmailStatus" "EmailSendStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "booking" ADD COLUMN "officeEmailStatus" "EmailSendStatus" NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "contact_message_officeEmailStatus_idx" ON "contact_message"("officeEmailStatus");

-- CreateIndex
CREATE INDEX "trip_application_officeEmailStatus_idx" ON "trip_application"("officeEmailStatus");

-- CreateIndex
CREATE INDEX "booking_officeEmailStatus_idx" ON "booking"("officeEmailStatus");
