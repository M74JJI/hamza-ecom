import { NextResponse } from "next/server";

// TODO: Implement Google OAuth callback: exchange code, fetch profile, upsert user, create session.
export async function GET(){
  return NextResponse.json({ todo: "Implement Google OAuth callback" }, { status: 501 });
}
