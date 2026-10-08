import { prisma } from "@/lib/db";
import { VariantForm } from "./variant-form";

export default async function ProductVariantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: { include: { sizes: true } } },
  });

  if (!product) {
    return <div className="container py-12">Product not found.</div>;
  }

  const variants = product.variants.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-semibold">
          Variants — {product.brand || product.slug}
        </h1>
        <a
          className="hz-admin-secondary"
          href={`/dashboard/products/${product.id}`}
        >
          Back to product
        </a>
      </div>

      <VariantForm productId={product.id} />

      <div className="hz-admin-panel overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Color</th>
              <th className="text-left p-3">Sizes</th>
              <th className="text-left p-3">Active</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                <td className="p-3">{v.title}</td>
                <td className="p-3">{v.color || "—"}</td>
                <td className="p-3">
                  {v.sizes.map((s) => (
                    <div key={s.id}>
                      {s.size} — {Number(s.priceMAD).toFixed(2)} MAD — Stock: {s.stockQty}
                    </div>
                  ))}
                </td>
                <td className="p-3">{v.isActive ? "Yes" : "No"}</td>
                <td className="p-3">
                  <form
                    action={`/dashboard/products/${product.id}/variants/edit`}
                    method="GET"
                    className="inline"
                  >
                    <input type="hidden" name="vid" value={v.id} />
                    <button className="mr-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-neutral-100">Edit</button>
                  </form>
                  <form
                    action={`/dashboard/products/${product.id}/variants/delete`}
                    method="POST"
                    className="inline"
                  >
                    <input type="hidden" name="id" value={v.id} />
                    <button className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
