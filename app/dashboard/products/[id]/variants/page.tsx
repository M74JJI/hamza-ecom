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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Variants — {product.brand || product.slug}
        </h1>
        <a
          className="underline opacity-80 hover:opacity-100"
          href={`/dashboard/products/${product.id}`}
        >
          Back to product
        </a>
      </div>

      <VariantForm productId={product.id} />

      <div className="border border-white/10 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
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
              <tr key={v.id} className="border-t border-white/10">
                <td className="p-3">{v.title}</td>
                <td className="p-3">{v.color || "—"}</td>
                <td className="p-3">
                  {v.sizes.map((s) => (
                    <div key={s.id}>
                      {s.size} — {s.priceMAD} MAD — Stock: {s.stockQty}
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
                    <button className="underline mr-3">Edit</button>
                  </form>
                  <form
                    action={`/dashboard/products/${product.id}/variants/delete`}
                    method="POST"
                    className="inline"
                  >
                    <input type="hidden" name="id" value={v.id} />
                    <button className="underline text-red-400 hover:text-red-300">
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
