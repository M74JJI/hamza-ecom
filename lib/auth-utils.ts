import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import * as argon2 from "argon2";
import { prisma } from "./db";
import nodemailer from "nodemailer";

const SESSION_COOKIE = "session";

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
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function createSession(userId: string, maxAgeDays = 30) {
  const cookieStore = await cookies();
  const token = tokenString(24);
  const expires = new Date(Date.now() + maxAgeDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({ data: { userId, token, expires } });

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: sessionCookieSecure(),
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  cookieStore.set(SESSION_COOKIE, "", {
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
      ...(exceptToken ? { token: { not: exceptToken } } : {}),
    },
  });
}

export async function getSessionUser() {
  const token = await getCurrentSessionToken();
  if (!token) return null;

  const session = await prisma.session.findFirst({
    where: { token, expires: { gt: new Date() } },
    include: { user: true },
  });

  return session?.user ?? null;
}

export function getTransport() {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const from = process.env.AUTH_EMAIL_FROM || "no-reply@example.com";
  const transporter = getTransport();
  await transporter.sendMail({ to, from, subject, html });
}
