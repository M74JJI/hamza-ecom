"use server";

import { requireAdmin } from "@/lib/require-admin";
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
