import ResetPasswordEmail from "@/emails/ResetPasswordEmail";
import { renderEmail } from "@/lib/render-email";
import { sendEmail } from "@/lib/auth-utils";

export async function sendResetEmail(to: string, link: string){
  const html = renderEmail(ResetPasswordEmail({ resetUrl: link } as any));
  await sendEmail(to, "Reset your password", html);
}
