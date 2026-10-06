import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import * as argon2 from "argon2";
import { prisma } from "./db";
import {
  SESSION_COOKIE_NAME,
  getPersistedSessionTokenCandidates,
  hashSessionToken,
  isLegacyPlaintextSessionToken,
} from "@/lib/session-token";

function sessionCookieSecure() {
  return process.env.NODE_ENV === "production";
}

export async function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

function tokenString(len = 48) {
  return randomBytes(len).toString("hex");
}

export async function getCurrentSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function createSession(userId: string, maxAgeDays = 30) {
  const cookieStore = await cookies();
  const rawToken = tokenString(24);
  const expires = new Date(Date.now() + maxAgeDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      token: hashSessionToken(rawToken),
      expires,
    },
  });

  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: sessionCookieSecure(),
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    await prisma.session.deleteMany({
      where: {
        token: {
          in: getPersistedSessionTokenCandidates(rawToken),
        },
      },
    });
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: sessionCookieSecure(),
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function revokeUserSessions(userId: string, exceptToken?: string | null) {
  await prisma.session.deleteMany({
    where: {
      userId,
      ...(exceptToken
        ? {
            NOT: {
              token: {
                in: getPersistedSessionTokenCandidates(exceptToken),
              },
            },
          }
        : {}),
    },
  });
}

export async function getSessionUser() {
  const rawToken = await getCurrentSessionToken();
  if (!rawToken) return null;

  const session = await prisma.session.findFirst({
    where: {
      token: {
        in: getPersistedSessionTokenCandidates(rawToken),
      },
      expires: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!session) return null;

  if (isLegacyPlaintextSessionToken(session.token, rawToken)) {
    await prisma.session.update({
      where: { id: session.id },
      data: { token: hashSessionToken(rawToken) },
    });
  }

  return session.user;
}
