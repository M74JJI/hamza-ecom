import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function getCurrentUser() {
  try {
    // ✅ cookies() can return a Promise in Next 15+
    const c = await cookies();
    const sessionToken = c.get("session")?.value;
    if (!sessionToken) return null;

    const session = await prisma.session.findFirst({
      where: { token: sessionToken, expires: { gt: new Date() } },
      include: { user: true },
    });

    if (!session?.user) return null;

    const { passwordHash, ...safeUser } = session.user as any;
    return safeUser;
  } catch (err) {
    console.error("getCurrentUser() failed:", err);
    return null;
  }
}
