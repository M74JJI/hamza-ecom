import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, sendEmail } from "@/lib/auth-utils";
import { z } from "zod";
import { sendVerifyEmail } from "@/lib/emails/verify";

const schema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: Request){
  const form = await req.formData();
  const data = Object.fromEntries(form) as any;
  const parsed = schema.safeParse(data);
  if(!parsed.success){
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if(existing){
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, name, passwordHash } });

  // create email verification token
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000*60*60*24);
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires }
  });
  const base = process.env.APP_URL || "http://localhost:3000";
  const verifyUrl = `${base}/api/auth/verify?token=${token}`;
  await sendVerifyEmail(email, verifyUrl);

  return NextResponse.json({ ok: true });
}
