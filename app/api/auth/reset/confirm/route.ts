import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { hashPassword } from "@/lib/auth-utils";

const schema = z.object({ token: z.string().min(10), password: z.string().min(8) });

export async function POST(req: Request){
  const body = await req.json().catch(()=>null);
  const parsed = schema.safeParse(body || {});
  if(!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { token, password } = parsed.data;
  const t = await prisma.passwordResetToken.findFirst({ where: { token, expires: { gt: new Date() } } });
  if(!t) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: t.identifier },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { identifier: t.identifier } }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
