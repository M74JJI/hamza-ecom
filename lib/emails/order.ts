import OrderConfirmation from "@/emails/OrderConfirmation";
import { renderEmail } from "@/lib/render-email";
import { sendEmail } from "@/lib/auth-utils";

export async function sendOrderConfirmation(to: string, orderId: string){
  const html = renderEmail(OrderConfirmation({ orderId } as any));
  await sendEmail(to, "Your order is confirmed", html);
}
