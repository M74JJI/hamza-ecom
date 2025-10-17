// app/auth/signout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("session")?.value;

    if (token) {
      // Delete session from DB (if exists)
      await prisma.session.deleteMany({ where: { token } });
    }

    // Build a new response with cookie cleared
    const res = NextResponse.json({ ok: true });
    res.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0), // expire immediately
    });

    return res;
  } catch (err) {
    console.error("Sign-out failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to sign out" },
      { status: 500 },
    );
  }
}
