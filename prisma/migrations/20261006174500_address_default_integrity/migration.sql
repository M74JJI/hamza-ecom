-- Normalize legacy duplicate default addresses before enforcing uniqueness.
WITH ranked_defaults AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC, "id" DESC
    ) AS rn
  FROM "Address"
  WHERE "isDefault" = true
)
UPDATE "Address" AS a
SET
  "isDefault" = false,
  "updatedAt" = CURRENT_TIMESTAMP
FROM ranked_defaults AS ranked
WHERE a."id" = ranked."id"
  AND ranked.rn > 1;

-- PostgreSQL partial unique index: at most one default address per user.
CREATE UNIQUE INDEX "Address_one_default_per_user"
  ON "Address"("userId")
  WHERE "isDefault" = true;
