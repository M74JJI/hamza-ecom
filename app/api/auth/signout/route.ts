import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth-utils";
import { isSameOriginMutation } from "@/lib/security/request-origin";

export async function POST(req: Request) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json(
      { error: "Cross-origin request rejected" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

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
