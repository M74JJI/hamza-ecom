import { prisma } from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/enums";
import { getAllowedOrderTransitions } from "@/lib/orders/status";
import { sendOrderStatusUpdate } from "@/lib/emails/order-status";

export { getAllowedOrderTransitions, isOrderStatus } from "@/lib/orders/status";

export async function transitionOrderStatus(orderId: string, nextStatus: OrderStatus) {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          select: {
            variantSizeId: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      return { ok: false as const, error: "Order not found" };
    }

    if (order.status === nextStatus) {
      return { ok: true as const, status: order.status, changed: false as const };
    }

    const allowed = getAllowedOrderTransitions(order.status);
    if (!allowed.includes(nextStatus)) {
      return {
        ok: false as const,
        error: `Cannot change order from ${order.status} to ${nextStatus}`,
      };
    }

    const updated = await tx.order.updateMany({
      where: {
        id: order.id,
        status: order.status,
      },
      data: {
        status: nextStatus,
      },
    });

    if (updated.count !== 1) {
      return {
        ok: false as const,
        error: "Order status changed concurrently. Refresh and try again.",
      };
    }

    if (nextStatus === OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await tx.variantSize.update({
          where: { id: item.variantSizeId },
          data: {
            stockQty: { increment: item.quantity },
          },
        });
      }
    }

    return { ok: true as const, status: nextStatus, changed: true as const };
  });

  if (result.ok && result.changed) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { user: { select: { email: true } } },
      });
      if (order?.user?.email) {
        await sendOrderStatusUpdate(order.user.email, orderId, result.status);
      }
    } catch (error) {
      console.error("Order status email delivery failed", { orderId, error });
    }
  }

  return result;
}
