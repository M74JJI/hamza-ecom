import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendResetEmail } from "@/lib/emails/reset";
import { getAppUrl } from "@/lib/app-url";
import {
  consumeRateLimit,
  getClientIp,
  maxRetryAfter,
} from "@/lib/security/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request){
  const body = await req.json().catch(()=>null);
  const parsed = schema.safeParse(body || {});
  if(!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { email } = parsed.data;
  const ip = getClientIp(req);

  const decisions = await Promise.all([
    consumeRateLimit({
      scope: "auth:reset-request:ip",
      identifier: ip,
      limit: 12,
      windowMs: 60 * 60 * 1000,
    }),
    consumeRateLimit({
      scope: "auth:reset-request:email",
      identifier: email,
      limit: 6,
      windowMs: 60 * 60 * 1000,
    }),
  ]);

  if (decisions.some((decision) => !decision.allowed)) {
    return NextResponse.json(
      { error: "Too many reset requests. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(maxRetryAfter(decisions)),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if(!user) return NextResponse.json({ ok: true }); // do not reveal

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000*60*60);
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: { identifier: email },
    }),
    prisma.passwordResetToken.create({
      data: { identifier: email, token, expires },
    }),
  ]);

  const url = `${getAppUrl()}/reset?token=${token}`;
  await sendResetEmail(email, url);
  return NextResponse.json({ ok: true });
}

