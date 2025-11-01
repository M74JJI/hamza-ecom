import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth-utils";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(req: Request){
  const form = await req.formData();
  const data = Object.fromEntries(form) as any;
  const callbackUrl = (data.callbackUrl as string) || "/";

  const parsed = schema.safeParse(data);
  if(!parsed.success){
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
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
   return NextResponse.redirect(new URL(callbackUrl, req.url));

}
