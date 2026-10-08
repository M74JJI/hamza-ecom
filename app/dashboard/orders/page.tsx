import { prisma } from "@/lib/db";
import { OrdersClient } from "./OrdersClient";
import type { Prisma } from "@/generated/prisma/client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const PAGE_SIZES = [10, 20, 50] as const;

export default async function OrdersDashboard({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) || {};
  const page = Math.max(1, Number(resolvedSearchParams.page || 1) || 1);
  const requestedPageSize = Number(resolvedSearchParams.pageSize || 20);
  const pageSize = PAGE_SIZES.includes(requestedPageSize as 10 | 20 | 50)
    ? requestedPageSize
    : 20;
  const sort = resolvedSearchParams.sort || "latest";
  const search = resolvedSearchParams.search?.trim()?.toLowerCase() || "";
  const status = resolvedSearchParams.status || "all";
  const allowedStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
  const normalizedStatus = allowedStatuses.includes(status as (typeof allowedStatuses)[number])
    ? (status as (typeof allowedStatuses)[number])
    : null;

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
  const where: Prisma.OrderWhereInput = {
    AND: [
      normalizedStatus ? { status: normalizedStatus } : {},
      search ? {
        OR: [
          { id: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
          { shippingFullNameSnapshot: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
          { shippingPhoneSnapshot: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
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
      } : {},
    ],
  };

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
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

  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
  const serializedOrders = JSON.parse(JSON.stringify(orders));

  return (
    <OrdersClient
      orders={serializedOrders}
      currentPage={page}
      totalPages={totalPages}
      totalOrders={totalOrders}
      sort={sort}
      search={search}
      status={status}
      pageSize={pageSize}
    />
  );
}

