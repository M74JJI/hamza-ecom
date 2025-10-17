import VerifyEmail from "@/emails/VerifyEmail";
import { renderEmail } from "@/lib/render-email";
import { sendEmail } from "@/lib/auth-utils";

export async function sendVerifyEmail(to: string, link: string){
  const html = renderEmail(VerifyEmail({ verifyUrl: link } as any));
  await sendEmail(to, "Verify your email", html);
}
