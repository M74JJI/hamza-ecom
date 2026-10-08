// components/dashboard/AdminHeader.tsx
import { AdminHeaderClient } from "./AdminHeaderClient";
import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function AdminHeader() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;

  return <AdminHeaderClient user={user} />;
}
