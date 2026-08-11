-- Move localized country + meetingPoint onto trip_translation
ALTER TABLE "trip_translation" ADD COLUMN "country" TEXT;
ALTER TABLE "trip_translation" ADD COLUMN "meetingPoint" TEXT;

UPDATE "trip_translation" AS tt
SET
  "country" = t."country",
  "meetingPoint" = t."meetingPoint"
FROM "trip" AS t
WHERE t."id" = tt."tripId";

UPDATE "trip_translation"
SET
  "country" = COALESCE(NULLIF("country", ''), 'Unknown'),
  "meetingPoint" = COALESCE(NULLIF("meetingPoint", ''), 'TBD')
WHERE "country" IS NULL OR "meetingPoint" IS NULL;

ALTER TABLE "trip_translation" ALTER COLUMN "country" SET NOT NULL;
ALTER TABLE "trip_translation" ALTER COLUMN "meetingPoint" SET NOT NULL;

ALTER TABLE "trip" DROP COLUMN "country";
ALTER TABLE "trip" DROP COLUMN "meetingPoint";
