-- Normalize legacy review ratings before enforcing database checks.
UPDATE "Review"
SET "rating" = LEAST(5, GREATEST(1, "rating"))
WHERE "rating" < 1 OR "rating" > 5;

-- Keep the newest logical review when legacy duplicate user/product rows exist.
WITH ranked_reviews AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "productId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC, "id" DESC
    ) AS rn
  FROM "Review"
)
DELETE FROM "Review" AS r
USING ranked_reviews AS ranked
WHERE r."id" = ranked."id"
  AND ranked.rn > 1;

-- Recalculate the cached product rating after duplicate cleanup.
UPDATE "Product" AS p
SET "rating" = COALESCE(
  (
    SELECT AVG(r."rating")::DOUBLE PRECISION
    FROM "Review" AS r
    WHERE r."productId" = p."id"
  ),
  0
);

-- Merge legacy duplicate cart lines into the newest row.
WITH duplicate_cart_lines AS (
  SELECT
    "cartId",
    "variantSizeId",
    (
      ARRAY_AGG(
        "id"
        ORDER BY "updatedAt" DESC, "createdAt" DESC, "id" DESC
      )
    )[1] AS keeper_id,
    LEAST(
      10::BIGINT,
      GREATEST(1::BIGINT, SUM(GREATEST("quantity", 1)))
    )::INTEGER AS merged_quantity
  FROM "CartItem"
  GROUP BY "cartId", "variantSizeId"
  HAVING COUNT(*) > 1
)
UPDATE "CartItem" AS ci
SET
  "quantity" = d.merged_quantity,
  "updatedAt" = CURRENT_TIMESTAMP
FROM duplicate_cart_lines AS d
WHERE ci."id" = d.keeper_id;

WITH duplicate_cart_lines AS (
  SELECT
    "cartId",
    "variantSizeId",
    (
      ARRAY_AGG(
        "id"
        ORDER BY "updatedAt" DESC, "createdAt" DESC, "id" DESC
      )
    )[1] AS keeper_id
  FROM "CartItem"
  GROUP BY "cartId", "variantSizeId"
  HAVING COUNT(*) > 1
)
DELETE FROM "CartItem" AS ci
USING duplicate_cart_lines AS d
WHERE ci."cartId" = d."cartId"
  AND ci."variantSizeId" = d."variantSizeId"
  AND ci."id" <> d.keeper_id;

-- Normalize mutable catalog/cart data before adding CHECK constraints.
UPDATE "CartItem"
SET
  "quantity" = LEAST(10, GREATEST(1, "quantity")),
  "unitPriceMAD" = GREATEST(0, "unitPriceMAD")
WHERE
  "quantity" < 1 OR
  "quantity" > 10 OR
  "unitPriceMAD" < 0;

UPDATE "VariantSize"
SET
  "priceMAD" = GREATEST(0, "priceMAD"),
  "discountPercent" = CASE
    WHEN "discountPercent" IS NULL THEN NULL
    ELSE LEAST(100, GREATEST(0, "discountPercent"))
  END,
  "stockQty" = GREATEST(0, "stockQty")
WHERE
  "priceMAD" < 0 OR
  "stockQty" < 0 OR
  ("discountPercent" IS NOT NULL AND ("discountPercent" < 0 OR "discountPercent" > 100));

UPDATE "DeliveryCompany"
SET
  "priceMAD" = GREATEST(0, "priceMAD"),
  "avgDays" = GREATEST(0, "avgDays")
WHERE "priceMAD" < 0 OR "avgDays" < 0;

-- Invalid legacy coupons are disabled before their percentage is normalized.
UPDATE "Coupon"
SET "active" = false
WHERE "percent" < 1 OR "percent" > 100;

UPDATE "Coupon"
SET "percent" = LEAST(100, GREATEST(1, "percent"))
WHERE "percent" < 1 OR "percent" > 100;

-- Enforce logical uniqueness at the database boundary.
CREATE UNIQUE INDEX "Review_userId_productId_key"
  ON "Review"("userId", "productId");

CREATE UNIQUE INDEX "CartItem_cartId_variantSizeId_key"
  ON "CartItem"("cartId", "variantSizeId");

-- Enforce mutable commerce invariants at the database boundary.
ALTER TABLE "Review"
  ADD CONSTRAINT "Review_rating_check"
  CHECK ("rating" BETWEEN 1 AND 5);

ALTER TABLE "CartItem"
  ADD CONSTRAINT "CartItem_quantity_check"
  CHECK ("quantity" BETWEEN 1 AND 10),
  ADD CONSTRAINT "CartItem_unitPriceMAD_check"
  CHECK ("unitPriceMAD" >= 0);

ALTER TABLE "VariantSize"
  ADD CONSTRAINT "VariantSize_priceMAD_check"
  CHECK ("priceMAD" >= 0),
  ADD CONSTRAINT "VariantSize_discountPercent_check"
  CHECK ("discountPercent" IS NULL OR "discountPercent" BETWEEN 0 AND 100),
  ADD CONSTRAINT "VariantSize_stockQty_check"
  CHECK ("stockQty" >= 0);

ALTER TABLE "DeliveryCompany"
  ADD CONSTRAINT "DeliveryCompany_priceMAD_check"
  CHECK ("priceMAD" >= 0),
  ADD CONSTRAINT "DeliveryCompany_avgDays_check"
  CHECK ("avgDays" >= 0);

ALTER TABLE "Coupon"
  ADD CONSTRAINT "Coupon_percent_check"
  CHECK ("percent" BETWEEN 1 AND 100);
