import { sendEmail } from "@/lib/email";
import { renderEmail } from "@/lib/render-email";
import OrderStatusUpdate from "@/emails/OrderStatusUpdate";
import { getEmailBrandUrls } from "@/lib/emails/brand";

export async function sendOrderStatusUpdate(to: string, orderId: string, status: string){
  const { appUrl, logoUrl } = getEmailBrandUrls();
  const html = await renderEmail(OrderStatusUpdate({
    orderId,
    status,
    logoUrl,
    orderUrl: `${appUrl}/profile/orders/${orderId}`,
  }));
  await sendEmail(to, `HAMZA order update: ${status}`, html);
}
