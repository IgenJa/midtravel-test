-- AlterTable
ALTER TABLE "booking" ADD COLUMN "read" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "booking_read_idx" ON "booking"("read");

-- Paid bookings without an issued invoice still need attention.
UPDATE "booking"
SET "read" = false
WHERE "status" = 'paid'
  AND NOT EXISTS (
    SELECT 1
    FROM "invoice"
    WHERE "invoice"."bookingId" = "booking"."id"
      AND "invoice"."invoiceNumber" IS NOT NULL
      AND "invoice"."issuedAt" IS NOT NULL
  );
