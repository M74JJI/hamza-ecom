import { getSessionUser } from "@/lib/auth-utils";

export async function getCurrentUser() {
  try {
    const user = await getSessionUser();
    if (!user) return null;

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    console.error("getCurrentUser() failed:", error);
    return null;
  }
}
