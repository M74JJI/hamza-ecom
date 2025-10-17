// components/dashboard/AdminHeader.tsx
import { prisma } from "@/lib/db";
import { AdminHeaderClient } from "./AdminHeaderClient";
import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function AdminHeader() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;

  // ---- STATS ----
  const [
    totalRevenueConfirmed,
    totalRevenuePending,
    totalOrders,
    totalProducts,
    recentRevenue
  ] = await Promise.all([
    // Confirmed / Shipped / Delivered = Realized revenue
    prisma.order.aggregate({
      _sum: { totalMAD: true },
      where: {
        status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
      },
    }),

    // Pending = Orders not yet confirmed
    prisma.order.aggregate({
      _sum: { totalMAD: true },
      where: {
        status: "PENDING",
      },
    }),

    prisma.order.count(),
    prisma.product.count(),

    // Last 24 hours revenue
    prisma.order.aggregate({
      _sum: { totalMAD: true },
      where: {
        status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const confirmedRevenue = totalRevenueConfirmed._sum.totalMAD ?? 0;
  const pendingRevenue = totalRevenuePending._sum.totalMAD ?? 0;
  const revenue = confirmedRevenue.toFixed(0);
  const pending = pendingRevenue.toFixed(0);
  const orders = totalOrders;
  const products = totalProducts;
  const growth = "+12%"; // placeholder — can later be computed from weekly trend

  return (
    <AdminHeaderClient
      user={user}
      stats={{
        revenue,
        pending,
        orders,
        products,
        growth,
      }}
    />
  );
}
