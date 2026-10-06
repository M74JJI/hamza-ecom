-- Normalize any legacy duplicate default addresses before enforcing the invariant.
WITH ranked_defaults AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC, "id" ASC
    ) AS row_number
  FROM "Address"
  WHERE "isDefault" = TRUE
)
UPDATE "Address" AS address
SET "isDefault" = FALSE
FROM ranked_defaults
WHERE address."id" = ranked_defaults."id"
  AND ranked_defaults.row_number > 1;

-- PostgreSQL partial uniqueness: each user may have zero or one default address.
CREATE UNIQUE INDEX "Address_one_default_per_user"
ON "Address" ("userId")
WHERE "isDefault" = TRUE;
