import nodemailer, { type Transporter } from "nodemailer";
import { getEmailConfig } from "@/lib/email-config";

let cachedTransporter: Transporter | null = null;
let cachedKey: string | null = null;

function getTransporter() {
  const config = getEmailConfig();
  const key = JSON.stringify([
    config.host,
    config.port,
    config.secure,
    config.user,
    config.pass,
  ]);

  if (!cachedTransporter || cachedKey !== key) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    cachedKey = key;
  }

  return {
    transporter: cachedTransporter,
    from: config.from,
  };
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
) {
  const { transporter, from } = getTransporter();

  return transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}
