import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth-utils";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Sign-out failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to sign out" },
      { status: 500 },
    );
  }
}
