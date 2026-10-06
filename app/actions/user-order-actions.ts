"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/enums";
import { transitionOrderStatus } from "@/lib/orders/transition";

export async function cancelOrderAction(orderId: string) {
  const { user } = await requireUser();

  const ownedOrder = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    select: { id: true },
  });

  if (!ownedOrder) {
    return { error: "Order not found" };
  }

  const result = await transitionOrderStatus(ownedOrder.id, OrderStatus.CANCELLED);
  if (!result.ok) return result;

  revalidatePath("/profile/orders");
  revalidatePath(`/profile/orders/${ownedOrder.id}`);
  revalidatePath("/dashboard/orders");
  return result;
}
