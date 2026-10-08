import { prisma } from "@/lib/db";
import { VariantForm } from "../variant-form";

export default async function EditVariantPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ vid?: string }>;
}) {
  const { id } = await params;
  const { vid } = await searchParams;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product)
    return <div className="container py-12">Product not found.</div>;

  if (!vid)
    return <div className="container py-12">Variant id missing.</div>;

  const variant = await prisma.variant.findUnique({ where: { id: vid } });
  if (!variant)
    return <div className="container py-12">Variant not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-semibold">Edit Variant</h1>
        <a
          className="hz-admin-secondary"
          href={`/dashboard/products/${product.id}/variants`}
        >
          Back to variants
        </a>
      </div>
      <VariantForm productId={product.id} initial={variant} />
    </div>
  );
}
