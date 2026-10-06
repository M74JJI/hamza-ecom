import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth-utils";
import { z } from "zod";
import { sendVerifyEmail } from "@/lib/emails/verify";
import { getAppUrl } from "@/lib/app-url";
import { normalizeEmailIdentity } from "@/lib/auth/email-identity";
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
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().transform(normalizeEmailIdentity),
  password: z.string().min(8),
});

function signupSuccess() {
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

async function issueVerificationEmail(email: string) {
  const token = createOneTimeToken();
  const persistedToken = hashOneTimeToken(token);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: { identifier: email },
    }),
    prisma.verificationToken.create({
      data: {
        identifier: email,
        token: persistedToken,
        expires,
      },
    }),
  ]);

  const verifyUrl = `${getAppUrl()}/api/auth/verify?token=${token}`;
  await sendVerifyEmail(email, verifyUrl);
}

export async function POST(req: Request) {
  const form = await req.formData();
  const data = Object.fromEntries(form) as Record<string, FormDataEntryValue>;
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
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

  // Perform the expensive password hash for both new and existing identities.
  // This reduces the direct timing difference between the two response paths.
  const passwordHash = await hashPassword(password);

  const existing = await prisma.user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
    },
    select: {
      email: true,
      emailVerified: true,
    },
  });

  if (existing) {
    if (!existing.emailVerified) {
      await issueVerificationEmail(existing.email);
    }

    return signupSuccess();
  }

  let userEmail = email;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
      select: {
        email: true,
      },
    });

    userEmail = user.email;
  } catch (error: any) {
    // A concurrent request may have created the same normalized identity after
    // the case-insensitive existence check. Do not disclose that distinction.
    if (error?.code === "P2002") {
      return signupSuccess();
    }
    throw error;
  }

  await issueVerificationEmail(userEmail);
  return signupSuccess();
}
