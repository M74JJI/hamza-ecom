'use server';

import { requireAdmin } from "@/lib/require-admin";

import { prisma } from '@/lib/db';
import type { Prisma } from '@/generated/prisma/client';
import { ProductUpsertSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import sanitizeHtml from 'sanitize-html';
import slugify from 'slugify';

// 🧠 Helper: generate a unique slug by checking DB and incrementing if needed
async function generateUniqueSlug(db: Prisma.TransactionClient, base: string, excludeId?: string) {
  let slug = slugify(base, { lower: true, strict: true });
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const existing = await db.product.findFirst({
      where: {
        slug: uniqueSlug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) break;
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  return uniqueSlug;
}

export async function upsertProductAction(input: unknown) {
  await requireAdmin();
  const parsed = ProductUpsertSchema.safeParse(input);
  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return { error: 'Invalid input' };
  }
  const data = parsed.data;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const tx = await prisma.$transaction(async (db) => {
      let product;

      // 🧩 Step 1: Determine base slug
      let baseSlug = data.slug?.trim();
        if (!baseSlug) {
        const source = data.variants?.[0]?.title || `product-${Date.now()}`;
        baseSlug = slugify(source, { lower: true, strict: true });
      }

      // 🧩 Step 2: Ensure slug uniqueness
      const finalSlug = await generateUniqueSlug(db, baseSlug, data.id);

      // ============ UPDATE MODE ============
      if (data.id) {
        const existingProduct = await db.product.findUnique({
          where: { id: data.id },
          select: { id: true },
        });
        if (!existingProduct) {
          throw new Error('PRODUCT_NOT_FOUND');
        }

        product = await db.product.update({
          where: { id: existingProduct.id },
          data: {
            slug: finalSlug,
            status: data.status,
            isFeaturedInHero: data.isFeaturedInHero,
            brand: data.brand,
          },
        });

        await db.productDetail.deleteMany({ where: { productId: product.id } });
        await db.productHighlight.deleteMany({ where: { productId: product.id } });
        await db.productCategory.deleteMany({ where: { productId: product.id } });
      }

      // ============ CREATE MODE ============
      else {
        product = await db.product.create({
          data: {
            slug: finalSlug,
            status: data.status,
            isFeaturedInHero: data.isFeaturedInHero,
            brand: data.brand,
          },
        });
      }

      // ============ DETAILS ============
      if (data.details?.length) {
        await db.productDetail.createMany({
          data: data.details.map((d) => ({
            productId: product.id,
            label: d.label,
            value: d.value,
          })),
        });
      }

      // ============ HIGHLIGHTS ============
      if (data.highlights?.length) {
        await db.productHighlight.createMany({
          data: data.highlights.map((d: any) => ({
            productId: product.id,
            label: d.label,
            value: d.value,
          })),
        });
      }

      // ============ CATEGORIES ============
      if (data.categoryIds?.length) {
        await db.productCategory.createMany({
          data: data.categoryIds.map((id) => ({
            productId: product.id,
            categoryId: id,
          })),
        });
      }

      // ============ VARIANTS ============
      for (const [idx, v] of data.variants.entries()) {
        let variant = v.id
          ? await db.variant.findFirst({
              where: {
                id: v.id,
                productId: product.id,
              },
            })
          : null;

        if (v.id && !variant) {
          throw new Error('VARIANT_PRODUCT_MISMATCH');
        }

        if (variant) {
          variant = await db.variant.update({
            where: { id: variant.id },
            data: {
              title: v.title,
              name: v.name,
              color: v.color ?? null,
              variantStyleImg: v.variantStyleImg,
              shortDescription: v.shortDescription ?? null,
              contentHtml: v.contentHtml
                ? sanitizeHtml(v.contentHtml, {
                    allowedTags: false,
                    disallowedTagsMode: 'discard',
                    allowedAttributes: {
                      '*': [
                        'class', 'id', 'style', 'src', 'href', 'alt', 'title', 'width', 'height',
                        'target', 'rel', 'frameborder', 'allow', 'allowfullscreen', 'data-*',
                      ],
                    },
                    allowedSchemes: ['http', 'https', 'data', 'mailto'],
                    allowedSchemesByTag: {
                      img: ['http', 'https', 'data'],
                      iframe: ['http', 'https'],
                      video: ['http', 'https'],
                      audio: ['http', 'https'],
                      source: ['http', 'https'],
                    },
                    allowedIframeHostnames: [
                      'www.youtube.com',
                      'player.vimeo.com',
                      'embed.spotify.com',
                      'w.soundcloud.com',
                      'www.tiktok.com',
                      'www.facebook.com',
                    ],
                    transformTags: {
                      iframe: (tagName, attribs) => ({
                        tagName: 'iframe',
                        attribs: {
                          ...attribs,
                          loading: 'lazy',
                          referrerpolicy: 'no-referrer',
                          sandbox:
                            'allow-same-origin allow-scripts allow-presentation allow-popups allow-forms allow-modals',
                        },
                      }),
                    },
                    nonTextTags: ['style', 'script', 'textarea', 'option'],
                  })
                : null,
              sortOrder: v.sortOrder ?? idx,
              isActive: v.isActive ?? true,
            },
          });

          await db.variantImage.deleteMany({ where: { variantId: variant.id } });
        } else {
          variant = await db.variant.create({
            data: {
              productId: product.id,
              title: v.title,
              name: v.name,
              color: v.color ?? null,
              variantStyleImg: v.variantStyleImg,
              shortDescription: v.shortDescription ?? null,
              contentHtml: v.contentHtml
                ? sanitizeHtml(v.contentHtml, {
                    allowedTags: false,
                    disallowedTagsMode: 'discard',
                    allowedAttributes: {
                      '*': [
                        'class', 'id', 'style', 'src', 'href', 'alt', 'title', 'width', 'height',
                        'target', 'rel', 'frameborder', 'allow', 'allowfullscreen', 'data-*',
                      ],
                    },
                    allowedSchemes: ['http', 'https', 'data', 'mailto'],
                    allowedSchemesByTag: {
                      img: ['http', 'https', 'data'],
                      iframe: ['http', 'https'],
                      video: ['http', 'https'],
                      audio: ['http', 'https'],
                      source: ['http', 'https'],
                    },
                    allowedIframeHostnames: [
                      'www.youtube.com',
                      'player.vimeo.com',
                      'embed.spotify.com',
                      'w.soundcloud.com',
                      'www.tiktok.com',
                      'www.facebook.com',
                    ],
                    transformTags: {
                      iframe: (tagName, attribs) => ({
                        tagName: 'iframe',
                        attribs: {
                          ...attribs,
                          loading: 'lazy',
                          referrerpolicy: 'no-referrer',
                          sandbox:
                            'allow-same-origin allow-scripts allow-presentation allow-popups allow-forms allow-modals',
                        },
                      }),
                    },
                    nonTextTags: ['style', 'script', 'textarea', 'option'],
                  })
                : null,
              sortOrder: v.sortOrder ?? idx,
              isActive: v.isActive ?? true,
            },
          });
        }

        // ============ VARIANT IMAGES ============
        const imgs = (v.images || []).slice(0, 6);
        if (imgs.length) {
          await db.variantImage.createMany({
            data: imgs.map((img, i) => ({
              variantId: variant.id,
              url: img.url,
              sortOrder: img.sortOrder ?? i,
            })),
          });
        }

        // ============ VARIANT SIZES ============
        if (v.sizes?.length) {
          for (const s of v.sizes) {
            const normalizedSku = s.sku.trim();

            const existingSize = s.id
              ? await db.variantSize.findUnique({
                  where: { id: s.id },
                  include: {
                    variant: {
                      select: {
                        id: true,
                        productId: true,
                      },
                    },
                  },
                })
              : await db.variantSize.findUnique({
                  where: { sku: normalizedSku },
                  include: {
                    variant: {
                      select: {
                        id: true,
                        productId: true,
                      },
                    },
                  },
                });

            if (s.id && !existingSize) {
              throw new Error('VARIANT_SIZE_NOT_FOUND');
            }

            if (existingSize) {
              if (
                existingSize.variant.productId !== product.id ||
                existingSize.variantId !== variant.id
              ) {
                throw new Error('SKU_VARIANT_MISMATCH');
              }

              await db.variantSize.update({
                where: { id: existingSize.id },
                data: {
                  sku: normalizedSku,
                  size: s.size,
                  priceMAD: Number(s.priceMAD),
                  discountPercent: s.discountPercent ?? 0,
                  stockQty: s.stockQty,
                  isActive: s.isActive ?? true,
                },
              });
            } else {
              await db.variantSize.create({
                data: {
                  variantId: variant.id,
                  size: s.size,
                  sku: normalizedSku,
                  priceMAD: Number(s.priceMAD),
                  discountPercent: s.discountPercent ?? 0,
                  stockQty: s.stockQty,
                  isActive: s.isActive ?? true,
                },
              });
            }
          }
        }
      }

        return product;
      }, {
        isolationLevel: 'Serializable',
      });

      revalidatePath('/dashboard/products');
      revalidatePath('/products');

      return { ok: true, id: tx.id };
    } catch (err: any) {
      console.error('❌ upsertProductAction failed:', err);

      const target = Array.isArray(err?.meta?.target)
        ? err.meta.target.join(',')
        : String(err?.meta?.target ?? '');

      const retryableSlugRace =
        err?.code === 'P2034' ||
        (err?.code === 'P2002' && target.includes('slug'));

      if (retryableSlugRace && attempt < 2) {
        continue;
      }

    if (err?.message === 'PRODUCT_NOT_FOUND') {
      return { error: 'Product not found.' };
    }
    if (err?.message === 'VARIANT_PRODUCT_MISMATCH') {
      return { error: 'A submitted variant does not belong to this product.' };
    }
    if (err?.message === 'VARIANT_SIZE_NOT_FOUND') {
      return { error: 'A submitted variant size no longer exists.' };
    }
    if (err?.message === 'SKU_VARIANT_MISMATCH') {
      return { error: 'A SKU cannot be moved between variants or products.' };
    }

      if (err?.code === 'P2002') {
        if (target.includes('sku')) {
          return { error: 'Duplicate SKU detected. Please ensure each SKU is unique.' };
        }
        if (target.includes('slug')) {
          return { error: 'Product slug already exists. Please retry with a different slug.' };
        }
      }

      if (err?.code === 'P2034') {
        return { error: 'Product was modified concurrently. Please retry.' };
      }

      return { error: 'Unexpected error while saving product.' };
    }
  }

  return { error: 'Unable to save product after multiple concurrent retries.' };
}
