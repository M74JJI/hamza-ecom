import { transporter } from "@/lib/mailer";

export async function sendWelcomeEmail(to: string) {
  await transporter.sendMail({
    from: `"Hajzen Store" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Welcome to Hajzen Store 🎉",
    html: "<h1>Welcome!</h1><p>Thank you for signing up at Hajzen Store.</p>",
  });
}