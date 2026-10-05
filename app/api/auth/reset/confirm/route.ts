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
