// app/dashboard/layout.tsx
import { ReactNode } from "react";
import { requireAdmin } from "@/lib/require-admin";
import { AdminSidebar } from "@/components/dashboard/sidebar";
import { AdminHeader } from "@/components/dashboard/header";
import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const user = await getCurrentUser();
  
  await requireAdmin();
  
  return (
    <div className="hz-admin min-h-screen bg-neutral-50 text-neutral-950">
      <div className="flex min-h-screen">
        <AdminSidebar user={user}/>
        <div className="min-w-0 flex-1 pb-20 lg:pb-0">
          <AdminHeader />
          <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
