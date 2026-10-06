-- Add immutable order-level shipping snapshots.
ALTER TABLE "Order"
  ADD COLUMN "shippingFullNameSnapshot" TEXT,
  ADD COLUMN "shippingPhoneSnapshot" TEXT,
  ADD COLUMN "shippingCitySnapshot" TEXT,
  ADD COLUMN "shippingAddressSnapshot" TEXT,
  ADD COLUMN "shippingCompanyNameSnapshot" TEXT;

-- Add immutable order-item presentation snapshots.
ALTER TABLE "OrderItem"
  ADD COLUMN "productBrandSnapshot" TEXT,
  ADD COLUMN "imageSnapshot" TEXT;

-- Backfill address snapshots where the original address still exists.
UPDATE "Order" AS o
SET
  "shippingFullNameSnapshot" = a."fullName",
  "shippingPhoneSnapshot" = a."phone",
  "shippingCitySnapshot" = a."city",
  "shippingAddressSnapshot" = a."fullAddress"
FROM "Address" AS a
WHERE o."shippingAddressId" = a."id";

-- Backfill delivery-company name where the original company still exists.
UPDATE "Order" AS o
SET "shippingCompanyNameSnapshot" = dc."name"
FROM "DeliveryCompany" AS dc
WHERE o."shippingCompanyId" = dc."id";

-- Backfill product brand for existing line items.
UPDATE "OrderItem" AS oi
SET "productBrandSnapshot" = p."brand"
FROM "VariantSize" AS vs
JOIN "Variant" AS v ON v."id" = vs."variantId"
JOIN "Product" AS p ON p."id" = v."productId"
WHERE oi."variantSizeId" = vs."id";

-- Backfill a representative product image for existing line items.
UPDATE "OrderItem" AS oi
SET "imageSnapshot" = COALESCE(
  (
    SELECT vi."url"
    FROM "VariantSize" AS vs
    JOIN "Variant" AS v ON v."id" = vs."variantId"
    JOIN "VariantImage" AS vi ON vi."variantId" = v."id"
    WHERE vs."id" = oi."variantSizeId"
    ORDER BY vi."sortOrder" ASC, vi."createdAt" ASC
    LIMIT 1
  ),
  (
    SELECT v."variantStyleImg"
    FROM "VariantSize" AS vs
    JOIN "Variant" AS v ON v."id" = vs."variantId"
    WHERE vs."id" = oi."variantSizeId"
    LIMIT 1
  )
)
WHERE oi."imageSnapshot" IS NULL;
