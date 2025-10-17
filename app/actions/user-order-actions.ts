'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";

export async function cancelOrderAction(orderId: string) {
  const { user } = await requireUser();

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { items: true },
  });

  if (!order) throw new Error("Order not found");

  if (order.status === "PENDING" || order.status === "CONFIRMED") {
    await prisma.$transaction(async (db) => {
      for (const item of order.items) {
        await db.variantSize.update({
          where: { id: item.variantSizeId },
          data: {
            stockQty: { increment: item.quantity },
          },
        });
      }

      await db.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
    });

    revalidatePath("/orders");
    return { ok: true };
  } else {
    return { error: "Cannot cancel once shipped" };
  }
}
