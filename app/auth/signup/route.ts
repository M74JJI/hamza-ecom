import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth-utils";
import { z } from "zod";
import { sendVerifyEmail } from "@/lib/emails/verify";
import { getAppUrl } from "@/lib/app-url";
import {
  createOneTimeToken,
  hashOneTimeToken,
} from "@/lib/one-time-token";
import {
  consumeRateLimit,
  getClientIp,
  maxRetryAfter,
} from "@/lib/security/rate-limit";

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
  const ip = getClientIp(req);

  const decisions = await Promise.all([
    consumeRateLimit({
      scope: "auth:signup:ip",
      identifier: ip,
      limit: 10,
      windowMs: 60 * 60 * 1000,
    }),
    consumeRateLimit({
      scope: "auth:signup:pair",
      identifier: `${ip}|${email}`,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    }),
  ]);

  if (decisions.some((decision) => !decision.allowed)) {
    return NextResponse.json(
      { error: "Too many sign-up attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(maxRetryAfter(decisions)),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if(existing){
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, name, passwordHash } });

  // create email verification token
  const token = createOneTimeToken();
  const persistedToken = hashOneTimeToken(token);
  const expires = new Date(Date.now() + 1000*60*60*24);
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: { identifier: email },
    }),
    prisma.verificationToken.create({
      data: { identifier: email, token: persistedToken, expires },
    }),
  ]);
  const verifyUrl = `${getAppUrl()}/api/auth/verify?token=${token}`;
  await sendVerifyEmail(email, verifyUrl);

  return NextResponse.json({ ok: true });
}
