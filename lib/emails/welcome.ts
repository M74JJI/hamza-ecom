import { sendEmail } from "@/lib/email";

export async function sendWelcomeEmail(to: string) {
  await sendEmail(
    to,
    "Welcome to Hajzen Store 🎉",
    "<h1>Welcome!</h1><p>Thank you for signing up at Hajzen Store.</p>",
  );
}
