'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(orderId: string, status: "PENDING"|"CONFIRMED"|"SHIPPED"|"DELIVERED"|"CANCELLED"){
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if(!order) return { error: "Order not found" };

  if(status === "CANCELLED" && order.status !== "CANCELLED"){
    for(const item of order.items){
      await prisma.variantSize.update({ where: { id: item.variantSizeId }, data: { stockQty: { increment: item.quantity } } });
    }
  }
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/dashboard/orders");
  return { ok: true };
}
