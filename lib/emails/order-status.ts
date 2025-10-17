import { sendEmail } from "@/lib/auth-utils";
import { renderEmail } from "@/lib/render-email";

export async function sendOrderStatusUpdate(to: string, orderId: string, status: string){
  const html = `<h1>Order Update</h1><p>Your order <b>${orderId}</b> is now <b>${status}</b>.</p>`;
  await sendEmail(to, "Order Status Update", html);
}
