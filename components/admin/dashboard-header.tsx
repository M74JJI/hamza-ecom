import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startOfDay, subDays } from "date-fns";
import { DashboardHeaderClient } from "./DashboardHeaderClient";
export const dynamic = "force-dynamic";

export async function DashboardHeader({
  from,
  to,
  exportButton,
}: {
  from?: Date;
  to?: Date;
  exportButton?: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;

  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = subDays(todayStart, 1);

  const [
    todayRevenue,
    yesterdayRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
  ] = await Promise.all([
    // Revenue today
    prisma.order.aggregate({
      _sum: { totalMAD: true },
      where: {
        placedAt: { gte: todayStart },
        status: { not: "CANCELLED" },
      },
    }),
    // Revenue yesterday
    prisma.order.aggregate({
      _sum: { totalMAD: true },
      where: {
        placedAt: { gte: yesterdayStart, lt: todayStart },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.order.count({
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.user.count(),
    prisma.product.count(),
  ]);

  const todayTotal = Number(todayRevenue._sum.totalMAD ?? 0);
  const yesterdayTotal = Number(yesterdayRevenue._sum.totalMAD ?? 0);
  const growth =
    yesterdayTotal > 0
      ? (((todayTotal - yesterdayTotal) / yesterdayTotal) * 100).toFixed(1)
      : "0.0";

  // Simple performance label
  const performance =
    Number(growth) > 10
      ? "Excellent"
      : Number(growth) > 0
      ? "Good"
      : "Needs Attention";

  const stats = {
    revenue: todayTotal.toFixed(0),
    orders: totalOrders,
    customers: totalCustomers,
    products: totalProducts,
    growth: `${Number(growth) >= 0 ? "+" : ""}${growth}%`,
    performance,
  };

  return <DashboardHeaderClient user={user} stats={stats} exportButton={exportButton} />;
}
