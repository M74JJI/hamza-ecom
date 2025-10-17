import { prisma } from "@/lib/db";
import { CustomersClient } from "./CustomerClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "USER" },
    include: {
      _count: { select: { orders: true } },
      orders: { select: { totalMAD: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const enriched = customers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt.toISOString(), // ✅ Convert Date → string
    totalOrders: u._count.orders,
    totalSpent: u.orders.reduce(
      (acc, o) => acc + Number(o.totalMAD || 0),
      0
    ),
  }));

  return <CustomersClient customers={enriched} />;
}
