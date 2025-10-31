import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendResetEmail } from "@/lib/emails/reset";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request){
  const body = await req.json().catch(()=>null);
  const parsed = schema.safeParse(body || {});
  if(!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if(!user) return NextResponse.json({ ok: true }); // do not reveal

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000*60*60);
  await prisma.passwordResetToken.create({ data: { identifier: email, token, expires } });

  const base = process.env.APP_URL || "http://localhost:3000";
  const url = `${base}/reset?token=${token}`;
  await sendResetEmail(email, url);
  return NextResponse.json({ ok: true });
}

