"use server";

import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  VariantStockAdjustSchema,
  VariantUpsertSchema,
} from "@/lib/z-variants";
import sanitizeHtml from "sanitize-html";

function sanitizeVariantHtml(value?: string) {
  if (!value) return null;

  return sanitizeHtml(value, {
    allowedTags: false,
    disallowedTagsMode: "discard",
    allowedAttributes: {
      "*": [
        "class",
        "id",
        "style",
        "src",
        "href",
        "alt",
        "title",
        "width",
        "height",
        "target",
        "rel",
        "frameborder",
        "allow",
        "allowfullscreen",
        "data-*",
      ],
    },
    allowedSchemes: ["http", "https", "data", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
      iframe: ["http", "https"],
      video: ["http", "https"],
      audio: ["http", "https"],
      source: ["http", "https"],
    },
    allowedIframeHostnames: [
      "www.youtube.com",
      "player.vimeo.com",
      "embed.spotify.com",
      "w.soundcloud.com",
      "www.tiktok.com",
      "www.facebook.com",
    ],
    transformTags: {
      iframe: (tagName, attribs) => ({
        tagName: "iframe",
        attribs: {
          ...attribs,
          loading: "lazy",
          referrerpolicy: "no-referrer",
          sandbox:
            "allow-same-origin allow-scripts allow-presentation allow-popups allow-forms allow-modals",
        },
      }),
    },
    nonTextTags: ["style", "script", "textarea", "option"],
  });
}

export async function upsertVariantAction(input: unknown) {
  await requireAdmin();

  const parsed = VariantUpsertSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };
  const variantInput = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id: variantInput.productId },
    select: { id: true },
  });
  if (!product) return { error: "Product not found" };

  if (variantInput.id) {
    const existing = await prisma.variant.findFirst({
      where: {
        id: variantInput.id,
        productId: product.id,
      },
      select: { id: true },
    });

    if (!existing) {
      return { error: "Variant not found for this product" };
    }

    await prisma.variant.update({
      where: { id: existing.id },
      data: {
        title: variantInput.title,
        name: variantInput.name,
        color: variantInput.color ?? null,
        variantStyleImg: variantInput.variantStyleImg,
        shortDescription: variantInput.shortDescription ?? null,
        contentHtml: sanitizeVariantHtml(variantInput.contentHtml),
        freeDelivery: variantInput.freeDelivery,
        isActive: variantInput.isActive,
        sortOrder: variantInput.sortOrder ?? 0,
      },
    });
  } else {
    await prisma.variant.create({
      data: {
        productId: product.id,
        title: variantInput.title,
        name: variantInput.name,
        color: variantInput.color ?? null,
        variantStyleImg: variantInput.variantStyleImg,
        shortDescription: variantInput.shortDescription ?? null,
        contentHtml: sanitizeVariantHtml(variantInput.contentHtml),
        freeDelivery: variantInput.freeDelivery,
        isActive: variantInput.isActive,
        sortOrder: variantInput.sortOrder ?? 0,
      },
    });
  }

  revalidatePath(`/dashboard/products/${product.id}/variants`);
  revalidatePath(`/products`);
  return { ok: true };
}

export async function deleteVariantAction({ id }: { id: string }) {
  await requireAdmin();

  const variant = await prisma.variant.findUnique({
    where: { id },
    select: {
      id: true,
      productId: true,
      sizes: {
        select: {
          _count: {
            select: {
              orderItems: true,
              cartItems: true,
            },
          },
        },
      },
    },
  });

  if (!variant) return { error: "Variant not found" };

  const isReferenced = variant.sizes.some(
    (size) => size._count.orderItems > 0 || size._count.cartItems > 0,
  );

  if (isReferenced) {
    await prisma.$transaction([
      prisma.variant.update({
        where: { id: variant.id },
        data: { isActive: false },
      }),
      prisma.variantSize.updateMany({
        where: { variantId: variant.id },
        data: { isActive: false },
      }),
    ]);
  } else {
    await prisma.variant.delete({
      where: { id: variant.id },
    });
  }

  revalidatePath(`/dashboard/products/${variant.productId}/variants`);
  revalidatePath("/products");

  return {
    ok: true,
    archived: isReferenced,
  };
}

export async function adjustVariantStockAction(input: unknown) {
  await requireAdmin();

  const parsed = VariantStockAdjustSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid stock adjustment" };
  }

  const { id, delta } = parsed.data;

  const adjusted = await prisma.variantSize.updateMany({
    where: {
      id,
      ...(delta < 0 ? { stockQty: { gte: Math.abs(delta) } } : {}),
    },
    data: {
      stockQty: { increment: delta },
    },
  });

  if (adjusted.count !== 1) {
    return {
      error:
        delta < 0
          ? "Insufficient stock or variant size not found"
          : "Variant size not found",
    };
  }

  const updated = await prisma.variantSize.findUnique({
    where: { id },
    select: {
      stockQty: true,
      variant: {
        select: { productId: true },
      },
    },
  });

  if (!updated) {
    return { error: "Variant size not found" };
  }

  revalidatePath(
    `/dashboard/products/${updated.variant.productId}/variants`,
  );
  revalidatePath("/products");

  return { ok: true, stockQty: updated.stockQty };
}
