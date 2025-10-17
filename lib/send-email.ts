import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, html: string) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    console.error('Missing SMTP credentials (SMTP_USER / SMTP_PASS)');
    throw new Error('SMTP not configured');
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
  const info = await transporter.sendMail({
    from: `Hajzen Store <${user}>`,
    to, subject, html,
  });
  return info;
}
