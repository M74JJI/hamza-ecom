import AdminOrderNotification from "@/emails/AdminOrderNotification";
import OrderConfirmationEmail from "@/emails/order-confirmation";
import type { OrderEmailData } from "@/emails/order-types";
import { sendEmail } from "@/lib/email";
import { getEmailBrandUrls } from "@/lib/emails/brand";
import { renderEmail } from "@/lib/render-email";

export async function sendOrderCreatedEmails(order: OrderEmailData, adminEmails: string[]) {
  const { appUrl, logoUrl } = getEmailBrandUrls();
  const shortId = order.id.slice(0, 8).toUpperCase();
  const configuredAdmins = (process.env.ORDER_NOTIFICATION_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const recipients = Array.from(new Set([...adminEmails, ...configuredAdmins]));

  const customerHtml = await renderEmail(OrderConfirmationEmail({
    order,
    logoUrl,
    orderUrl: `${appUrl}/profile/orders/${order.id}`,
  }));
  const adminHtml = await renderEmail(AdminOrderNotification({
    order,
    logoUrl,
    dashboardUrl: `${appUrl}/dashboard/orders?search=${encodeURIComponent(order.id)}`,
  }));

  const deliveries = [
    sendEmail(order.customerEmail, `HAMZA order #${shortId} received`, customerHtml),
    ...recipients.map((email) => sendEmail(email, `New HAMZA order #${shortId}`, adminHtml)),
  ];
  const results = await Promise.allSettled(deliveries);
  const failures = results.filter((result) => result.status === "rejected");

  if (failures.length > 0) {
    console.error("Order email delivery failed", {
      orderId: order.id,
      failed: failures.length,
      attempted: results.length,
    });
  }

  return { attempted: results.length, failed: failures.length };
}
