import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth-utils";
import { z } from "zod";
import { getSafeCallbackPath } from "@/lib/auth/redirect";
import { normalizeEmailIdentity } from "@/lib/auth/email-identity";
import {
import { isSameOriginMutation } from "@/lib/security/request-origin";
  consumeRateLimit,
  getClientIp,
  maxRetryAfter,
} from "@/lib/security/rate-limit";

const schema = z.object({
  email: z.string().trim().email().transform(normalizeEmailIdentity),
  password: z.string().min(8)
});

export async function POST(req: Request){
  if (!isSameOriginMutation(req)) {
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const form = await req.formData();
  const data = Object.fromEntries(form) as Record<string, FormDataEntryValue>;
  const callbackUrl = getSafeCallbackPath(data.callbackUrl);

  const parsed = schema.safeParse(data);
  if(!parsed.success){
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const ip = getClientIp(req);

  const decisions = await Promise.all([
    consumeRateLimit({
      scope: "auth:signin:ip",
      identifier: ip,
      limit: 30,
      windowMs: 15 * 60 * 1000,
    }),
    consumeRateLimit({
      scope: "auth:signin:pair",
      identifier: `${ip}|${email}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    }),
    consumeRateLimit({
      scope: "auth:signin:email",
      identifier: email,
      limit: 50,
      windowMs: 15 * 60 * 1000,
    }),
  ]);

  if (decisions.some((decision) => !decision.allowed)) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(maxRetryAfter(decisions)),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
    },
  });
  if(!user || !user.passwordHash){
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const ok = await verifyPassword(user.passwordHash, password);
  if(!ok){
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  if(!user.emailVerified){
    return NextResponse.json({ error: "Please verify your email first." }, { status: 403 });
  }
  await createSession(user.id);
  return NextResponse.redirect(new URL(callbackUrl, req.url), 303);

}
