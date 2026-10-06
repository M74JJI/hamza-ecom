import { getSessionUser } from "@/lib/auth-utils";

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await getSessionUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
