import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// Minimal helper: find Session by token cookie "session_token"
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) return null;
    const session = await prisma.session.findUnique({ where: { token } });
    if (!session) return null;
    if (session.expires && session.expires < new Date()) return null;
    return session.userId;
  } catch {
    return null;
  }
}
