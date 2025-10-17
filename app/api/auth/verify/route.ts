import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if(!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const vt = await prisma.verificationToken.findFirst({ where: { token, expires: { gt: new Date() } } });
  if(!vt) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

  await prisma.$transaction([
    prisma.user.update({ where: { email: vt.identifier }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.delete({ where: { id: vt.id } }),
  ]);

  return NextResponse.redirect(new URL("/?verified=1", process.env.APP_URL || "http://localhost:3000"));
}
