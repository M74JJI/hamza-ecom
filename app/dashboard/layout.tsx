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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/10">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400/5 to-emerald-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex">
        {/* Enhanced Sidebar */}
        <AdminSidebar user={user}/>
        
        {/* Main Content Area */}
        <div className="flex-1 ">
          <AdminHeader />
          <main className="p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}