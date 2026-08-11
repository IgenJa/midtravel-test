-- Align booking/payment currency with trip prices (EUR)
ALTER TABLE "booking" ALTER COLUMN "currency" SET DEFAULT 'EUR';
ALTER TABLE "payment" ALTER COLUMN "currency" SET DEFAULT 'EUR';

UPDATE "booking" SET "currency" = 'EUR' WHERE "currency" = 'HUF';
UPDATE "payment" SET "currency" = 'EUR' WHERE "currency" = 'HUF';
