import { getSessionUser } from "@/lib/auth-utils";

export async function getCurrentUser() {
  try {
    const user = await getSessionUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error("getCurrentUser() failed:", error);
    return null;
  }
}
