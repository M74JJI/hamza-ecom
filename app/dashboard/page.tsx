// app/dashboard/page.tsx
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import {
  SalesOverTime,
  OrdersByStatus,
  TopProducts,
  OrdersByCity,
  StatsGrid,
} from "@/components/admin/charts";
import {
  parseISO,
  startOfDay,
  endOfDay,
  differenceInDays,
  subDays,
  format,
} from "date-fns";
import { LowStockAlert } from "@/components/admin/low-stock-alert";
import { DashboardHeader } from "@/components/admin/dashboard-header";
import { ExportCSVButton } from "@/components/admin/export-csv-button";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const fromParam = sp?.from ? parseISO(sp.from) : undefined;
  const toParam = sp?.to ? parseISO(sp.to) : undefined;

  const from = fromParam ?? new Date(0);
  const to = toParam ? endOfDay(toParam) : new Date();

  // --- Previous period (same duration) ---
  const daysDiff = Math.max(1, differenceInDays(to, from));
  const toPrev = subDays(from, 1);
  const fromPrev = subDays(from, daysDiff);

  const [
    orders,
    items,
    lowStock,
    totalRevenue,
    totalOrders,
    totalCustomers,
    avgOrderValue,
    prevRevenue,
    prevOrders,
    prevCustomers,
    prevAvgOrder,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { placedAt: { gte: from, lte: to } },
      orderBy: { placedAt: "asc" },
      include: { shippingAddress: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { placedAt: { gte: from, lte: to } } },
      include: {
        variantSize: { include: { variant: { include: { product: true } } } },
      },
    }),
    prisma.variantSize.findMany({
      where: { stockQty: { lt: 5 } },
      include: { variant: { include: { product: true } } },
    }),

    // --- Current period metrics ---
    prisma.order.aggregate({
      where: {
        placedAt: { gte: from, lte: to },
        status: { notIn: ["CANCELLED", "PENDING"] },
      },
      _sum: { totalMAD: true },
    }),
    prisma.order.count({
      where: {
        placedAt: { gte: from, lte: to },
        status: { notIn: ["CANCELLED"] },
      },
    }),
    prisma.user.count({
      where: { createdAt: { gte: from, lte: to } },
    }),
    prisma.order.aggregate({
      where: {
        placedAt: { gte: from, lte: to },
        status: { notIn: ["CANCELLED", "PENDING"] },
      },
      _avg: { totalMAD: true },
    }),

    // --- Previous period metrics ---
    prisma.order.aggregate({
      where: {
        placedAt: { gte: fromPrev, lte: toPrev },
        status: { notIn: ["CANCELLED", "PENDING"] },
      },
      _sum: { totalMAD: true },
    }),
    prisma.order.count({
      where: {
        placedAt: { gte: fromPrev, lte: toPrev },
        status: { notIn: ["CANCELLED", "PENDING"] },
      },
    }),
    prisma.user.count({
      where: { createdAt: { gte: fromPrev, lte: toPrev } },
    }),
    prisma.order.aggregate({
      where: {
        placedAt: { gte: fromPrev, lte: toPrev },
        status: { notIn: ["CANCELLED", "PENDING"] },
      },
      _avg: { totalMAD: true },
    }),
  ]);

  // --- Helper: compute percentage change ---
  function growth(current: number, prev: number): string {
    if (!prev || prev <= 0) {
      if (current > 0) return "New"; // brand new period
      return "0%"; // no activity both periods
    }
    const change = ((current - prev) / prev) * 100;
    const rounded = change.toFixed(1);
    return (change >= 0 ? "+" : "") + rounded + "%";
  }

  // --- Data transformation ---
  const byDate: Record<string, number> = {};
  orders.forEach((o) => {
    const date = format(startOfDay(o.placedAt ?? o.createdAt), "yyyy-MM-dd");
    byDate[date] =
      (byDate[date] ?? 0) +
      (o.status !== "CANCELLED" ? Number(o.totalMAD) : 0);
  });

  const salesSeries = Object.entries(byDate)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, total]) => ({ date, total }));

  const byStatus: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  orders.forEach(
    (o) => (byStatus[o.status] = (byStatus[o.status] ?? 0) + 1)
  );

  const statusSeries = Object.keys(byStatus).map((status) => ({
    status,
    name: status,
    count: byStatus[status],
  }));

  const qtyMap = new Map<string, { title: string; qty: number }>();
  items.forEach((i) => {
    const v = i.variantSize.variant;
    const title = v.title;
    const prev = qtyMap.get(title) ?? { title, qty: 0 };
    prev.qty += i.quantity;
    qtyMap.set(title, prev);
  });
  const top = Array.from(qtyMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  const cityCounts: Record<string, number> = {};
  orders.forEach((o) => {
    const city = o.shippingAddress?.city || "Unknown";
    cityCounts[city] = (cityCounts[city] ?? 0) + 1;
  });
  const citySeries = Object.entries(cityCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // --- Stats + growth ---
  const revenue = Number(totalRevenue._sum.totalMAD) || 0;
  const prevRevenueVal = Number(prevRevenue._sum.totalMAD) || 0;
  const avgOrderVal = Number(avgOrderValue._avg.totalMAD) || 0;
  const prevAvgOrderVal = Number(prevAvgOrder._avg.totalMAD) || 0;

  const stats = {
    revenue,
    orders: totalOrders,
    customers: totalCustomers,
    avgOrder: avgOrderVal,
    growth: {
      revenue: growth(revenue, prevRevenueVal),
      orders: growth(totalOrders, prevOrders),
      customers: growth(totalCustomers, prevCustomers),
      avgOrder: growth(avgOrderVal, prevAvgOrderVal),
    },
  };
  const exportData = {
    stats,
    salesSeries,
    statusSeries,
    topProducts: top,
    citySeries,
    lowStock,
    orders,
    items,
    dateRange: { from, to }
  };
  return (
    <div className="space-y-6">
      <DashboardHeader from={from} to={to} 
              exportButton={<ExportCSVButton data={exportData} />}

      />
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SalesOverTime data={salesSeries} />
        <OrdersByStatus data={statusSeries} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TopProducts data={top} />
        <OrdersByCity data={citySeries} />
      </div>

      <LowStockAlert lowStock={lowStock} />
    </div>
  );
}
