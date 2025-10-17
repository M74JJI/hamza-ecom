import { prisma } from "@/lib/db";
import { OrdersClient } from "./OrdersClient";
import type { Prisma } from "@prisma/client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function OrdersDashboard({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) || {};
  const page = Number(resolvedSearchParams.page || 1);
  const sort = resolvedSearchParams.sort || "latest";
  const search = resolvedSearchParams.search?.trim()?.toLowerCase() || "";

  // ✅ Use Prisma.SortOrder instead of plain strings
  const orderBy: Prisma.OrderOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" as Prisma.SortOrder }
      : sort === "total-asc"
      ? { totalMAD: "asc" as Prisma.SortOrder }
      : sort === "total-desc"
      ? { totalMAD: "desc" as Prisma.SortOrder }
      : { createdAt: "desc" as Prisma.SortOrder };

  // ✅ Cast "insensitive" to Prisma.QueryMode
  const where: Prisma.OrderWhereInput = search
    ? {
        OR: [
          { id: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
          {
            user: {
              name: { contains: search, mode: "insensitive" as Prisma.QueryMode },
            },
          },
          {
            user: {
              email: { contains: search, mode: "insensitive" as Prisma.QueryMode },
            },
          },
        ],
      }
    : {};

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: true,
        shippingCompany: true,
        items: {
          include: {
            variantSize: {
              include: {
                variant: {
                  include: {
                    product: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(totalOrders / PAGE_SIZE);

  return (
    <OrdersClient
      orders={orders}
      currentPage={page}
      totalPages={totalPages}
      totalOrders={totalOrders}
      sort={sort}
      search={search}
      pageSize={PAGE_SIZE}
    />
  );
}

