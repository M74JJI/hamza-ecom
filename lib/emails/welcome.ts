import { sendEmail } from "@/lib/email";
import WelcomeEmail from "@/emails/WelcomeEmail";
import { getEmailBrandUrls } from "@/lib/emails/brand";
import { renderEmail } from "@/lib/render-email";

export async function sendWelcomeEmail(to: string, name?: string) {
  const { appUrl, logoUrl } = getEmailBrandUrls();
  const html = await renderEmail(WelcomeEmail({ name, logoUrl, shopUrl: appUrl }));
  await sendEmail(to, "Welcome to HAMZA", html);
}
