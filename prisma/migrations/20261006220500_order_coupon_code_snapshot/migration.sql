-- Preserve the coupon code shown on historical orders independently
-- from the live Coupon relation, which may later be renamed or removed.
ALTER TABLE "Order"
ADD COLUMN "couponCodeSnapshot" TEXT;

UPDATE "Order"
SET "couponCodeSnapshot" = "couponCode"
WHERE "couponCode" IS NOT NULL;
