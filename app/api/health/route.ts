import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { publicDatabaseCache } from "@/lib/http/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok" },
      { headers: publicDatabaseCache(15) },
    );
  } catch {
    return NextResponse.json(
      { status: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
