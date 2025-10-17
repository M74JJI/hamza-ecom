"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client"; // ✅ import the generated enum

export async function updateOrderStatusAction(orderId: string, status: string) {
  const validStatuses: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  if (!validStatuses.includes(status as OrderStatus)) {
    throw new Error("Invalid status");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus }, // ✅ cast to enum
  });

  revalidatePath("/dashboard/orders");
}

export async function updateOrderNoteAction(orderId: string, note: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { note },
  });
  revalidatePath("/dashboard/orders");
}
