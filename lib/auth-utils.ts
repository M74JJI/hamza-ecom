import { cookies, headers } from "next/headers";
import { randomBytes } from "crypto";
import * as argon2 from "argon2";
import { prisma } from "./db";

export async function hashPassword(password: string){
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string){
  return argon2.verify(hash, password);
}

function tokenString(len = 48){
  return randomBytes(len).toString("hex");
}

export async function createSession(userId: string, maxAgeDays = 30){
    const c=await cookies()

  const token = tokenString(24);
  const expires = new Date(Date.now() + maxAgeDays*24*60*60*1000);
  await prisma.session.create({ data: { userId, token, expires } });
  c.set("session", token, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", expires
  });
}

export async function destroySession(){
  const c=await cookies()
  const token = c.get("session")?.value;
  if(!token) return;
  await prisma.session.deleteMany({ where: { token } });
  c.set("session", "", { httpOnly: true, secure: true, path: "/", expires: new Date(0) });
}

export async function getSessionUser(){
    const c=await cookies()

  const token = c.get("session")?.value;
  if(!token) return null;
  const session = await prisma.session.findFirst({
    where: { token, expires: { gt: new Date() } },
    include: { user: true }
  });
  return session?.user ?? null;
}

// Email utilities
import nodemailer from "nodemailer";

export function getTransport(){
  if (process.env.RESEND_API_KEY){
    // In a later patch, we can add Resend. For now, stick to SMTP via Nodemailer.
  }
  const secure = (process.env.SMTP_SECURE ?? "false") === "true";
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS,
    },
  });
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string){
  const from = process.env.AUTH_EMAIL_FROM || "no-reply@example.com";
  const transporter = getTransport();
  await transporter.sendMail({ to, from, subject, html });
}
