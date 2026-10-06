"use server";

import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isOrderStatus, transitionOrderStatus } from "@/lib/orders/transition";

export async function updateOrderStatusAction(orderId: string, status: string) {
  await requireAdmin();

  if (!isOrderStatus(status)) {
    return { error: "Invalid status" };
  }

  const result = await transitionOrderStatus(orderId, status);
  if (!result.ok) return result;

  revalidatePath("/dashboard/orders");
  revalidatePath("/profile/orders");
  return result;
}

export async function updateOrderNoteAction(orderId: string, note: string) {
  await requireAdmin();

  const normalizedNote = note.trim();
  if (normalizedNote.length > 2000) {
    return { error: "Note is too long" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { note: normalizedNote || null },
  });

  revalidatePath("/dashboard/orders");
  return { ok: true };
}
