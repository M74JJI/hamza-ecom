import { describe, expect, test } from "bun:test";
import {
  ProductUpsertSchema,
  VariantSizeSchema,
} from "../lib/validation.ts";
import {
  VariantStockAdjustSchema,
  VariantUpsertSchema,
} from "../lib/z-variants.ts";

function baseVariant(overrides = {}) {
  return {
    title: "Black Edition",
    name: "Black",
    color: "black",
    variantStyleImg: "https://example.com/style.jpg",
    images: [],
    sizes: [
      {
        size: "M",
        sku: "SKU-M-BLACK",
        priceMAD: 199,
        discountPercent: 0,
        stockQty: 5,
        isActive: true,
      },
    ],
    ...overrides,
  };
}

function baseProduct(overrides = {}) {
  return {
    slug: "example-product",
    status: "PUBLISHED",
    isFeaturedInHero: false,
    brand: "Example",
    variants: [baseVariant()],
    ...overrides,
  };
}

describe("admin catalog validation", () => {
  test("accepts a valid product payload", () => {
    expect(ProductUpsertSchema.safeParse(baseProduct()).success).toBe(true);
  });

  test("rejects duplicate SKUs across variants in one product payload", () => {
    const result = ProductUpsertSchema.safeParse(
      baseProduct({
        variants: [
          baseVariant(),
          baseVariant({
            title: "White Edition",
            name: "White",
            color: "white",
            variantStyleImg: "https://example.com/white.jpg",
            sizes: [
              {
                size: "L",
                sku: "SKU-M-BLACK",
                priceMAD: 219,
                stockQty: 3,
              },
            ],
          }),
        ],
      }),
    );

    expect(result.success).toBe(false);
  });

  test("rejects duplicate variant IDs in one product payload", () => {
    const result = ProductUpsertSchema.safeParse(
      baseProduct({
        variants: [
          baseVariant({ id: "variant-1" }),
          baseVariant({
            id: "variant-1",
            title: "Duplicate",
            name: "Duplicate",
            variantStyleImg: "https://example.com/other.jpg",
            sizes: [
              {
                size: "L",
                sku: "SKU-L-OTHER",
                priceMAD: 219,
                stockQty: 3,
              },
            ],
          }),
        ],
      }),
    );

    expect(result.success).toBe(false);
  });

  test("rejects negative stock and invalid discounts", () => {
    expect(
      VariantSizeSchema.safeParse({
        size: "M",
        sku: "SKU-1",
        priceMAD: 100,
        discountPercent: 101,
        stockQty: -1,
      }).success,
    ).toBe(false);
  });

  test("bounds stock adjustment requests and rejects zero", () => {
    expect(
      VariantStockAdjustSchema.safeParse({ id: "size-1", delta: 5 }).success,
    ).toBe(true);
    expect(
      VariantStockAdjustSchema.safeParse({ id: "size-1", delta: 0 }).success,
    ).toBe(false);
    expect(
      VariantStockAdjustSchema.safeParse({
        id: "size-1",
        delta: 1_000_001,
      }).success,
    ).toBe(false);
  });

  test("requires a product id and non-negative sort order for variant actions", () => {
    expect(
      VariantUpsertSchema.safeParse({
        productId: "",
        title: "Title",
        name: "Name",
        variantStyleImg: "https://example.com/image.jpg",
        freeDelivery: false,
        isActive: true,
      }).success,
    ).toBe(false);

    expect(
      VariantUpsertSchema.safeParse({
        productId: "product-1",
        title: "Title",
        name: "Name",
        variantStyleImg: "https://example.com/image.jpg",
        freeDelivery: false,
        isActive: true,
        sortOrder: -1,
      }).success,
    ).toBe(false);
  });
});
