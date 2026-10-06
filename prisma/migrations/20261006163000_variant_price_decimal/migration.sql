-- Store catalog prices as fixed-precision money values instead of binary floats.
ALTER TABLE "VariantSize"
  ALTER COLUMN "priceMAD"
  TYPE DECIMAL(10, 2)
  USING ROUND("priceMAD"::NUMERIC, 2);
