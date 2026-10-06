import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { hashPassword } from "@/lib/auth-utils";
import { getPersistedOneTimeTokenCandidates } from "@/lib/one-time-token";
import { isSameOriginMutation } from "@/lib/security/request-origin";
import {
  AUTH_ONE_TIME_TOKEN_MAX_LENGTH,
  AUTH_ONE_TIME_TOKEN_MIN_LENGTH,
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
} from "@/lib/auth/input-policy";
import {
  consumeRateLimit,
  getClientIp,
  maxRetryAfter,
} from "@/lib/security/rate-limit";

const schema = z.object({
  token: z.string().min(AUTH_ONE_TIME_TOKEN_MIN_LENGTH).max(AUTH_ONE_TIME_TOKEN_MAX_LENGTH),
  password: z.string().min(AUTH_PASSWORD_MIN_LENGTH).max(AUTH_PASSWORD_MAX_LENGTH),
});

export async function POST(req: Request){
  if (!isSameOriginMutation(req)) {
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const body = await req.json().catch(()=>null);
  const parsed = schema.safeParse(body || {});
  if(!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { token, password } = parsed.data;
  const ip = getClientIp(req);

  const decisions = await Promise.all([
    consumeRateLimit({
      scope: "auth:reset-confirm:ip",
      identifier: ip,
      limit: 30,
      windowMs: 15 * 60 * 1000,
    }),
    consumeRateLimit({
      scope: "auth:reset-confirm:token",
      identifier: token,
      limit: 8,
      windowMs: 15 * 60 * 1000,
    }),
  ]);

  if (decisions.some((decision) => !decision.allowed)) {
    return NextResponse.json(
      { error: "Too many reset attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(maxRetryAfter(decisions)),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const t = await prisma.passwordResetToken.findFirst({
    where: {
      token: { in: getPersistedOneTimeTokenCandidates(token) },
      expires: { gt: new Date() },
    },
  });
  if(!t) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: t.identifier },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  try {
    await prisma.$transaction(async (tx) => {
      const consumed = await tx.passwordResetToken.deleteMany({
        where: {
          id: t.id,
          expires: { gt: new Date() },
        },
      });

      if (consumed.count !== 1) {
        throw new Error("RESET_TOKEN_CONSUMED");
      }

      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      await tx.passwordResetToken.deleteMany({
        where: { identifier: t.identifier },
      });

      await tx.session.deleteMany({
        where: { userId: user.id },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RESET_TOKEN_CONSUMED") {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
