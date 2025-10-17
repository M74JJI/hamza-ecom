import { NextResponse } from "next/server";

// TODO: Implement Google OAuth start (build auth URL) and store state in cookie.
export async function GET(){
  return NextResponse.json({ todo: "Implement Google OAuth start" }, { status: 501 });
}
