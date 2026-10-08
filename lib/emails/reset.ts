import ResetPasswordEmail from "@/emails/ResetPasswordEmail";
import { renderEmail } from "@/lib/render-email";
import { sendEmail } from "@/lib/email";
import { getEmailBrandUrls } from "@/lib/emails/brand";

export async function sendResetEmail(to: string, link: string){
  const { logoUrl } = getEmailBrandUrls();
  const html = await renderEmail(ResetPasswordEmail({ resetUrl: link, logoUrl }));
  await sendEmail(to, "Reset your HAMZA password", html);
}
