'use server';

import { prisma } from '@/lib/db';
import { ProductUpsertSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import sanitizeHtml from 'sanitize-html';
import slugify from 'slugify';

// 🧠 Helper: generate a unique slug by checking DB and incrementing if needed
async function generateUniqueSlug(db: typeof prisma, base: string, excludeId?: string) {
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
  const parsed = ProductUpsertSchema.safeParse(input);
  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return { error: 'Invalid input' };
  }
  const data = parsed.data;

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
      const finalSlug = await generateUniqueSlug(prisma, baseSlug, data.id);

      // ============ UPDATE MODE ============
      if (data.id) {
        product = await db.product.update({
          where: { id: data.id },
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
          ? await db.variant.findUnique({ where: { id: v.id } })
          : null;

        if (variant) {
          variant = await db.variant.update({
            where: { id: v.id },
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
            const existingSize = await db.variantSize.findUnique({
              where: { sku: s.sku },
            });

            if (existingSize) {
              await db.variantSize.update({
                where: { sku: s.sku },
                data: {
                  variantId: variant.id,
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
                  sku: s.sku,
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
    });

    revalidatePath('/dashboard/products');
    revalidatePath('/products');

    return { ok: true, id: tx.id };
  } catch (err: any) {
    console.error('❌ upsertProductAction failed:', err);
    if (err.code === 'P2002' && err.meta?.target?.includes('sku')) {
      return { error: 'Duplicate SKU detected. Please ensure each SKU is unique.' };
    }
    return { error: 'Unexpected error while saving product.' };
  }
}
