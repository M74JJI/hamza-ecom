import VerifyEmail from "@/emails/VerifyEmail";
import { renderEmail } from "@/lib/render-email";
import { sendEmail } from "@/lib/email";
import { getEmailBrandUrls } from "@/lib/emails/brand";

export async function sendVerifyEmail(to: string, link: string){
  const { logoUrl } = getEmailBrandUrls();
  const html = await renderEmail(VerifyEmail({ verifyUrl: link, logoUrl }));
  await sendEmail(to, "Verify your HAMZA email", html);
}
