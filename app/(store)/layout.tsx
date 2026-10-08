import "../globals.css";
import { getCurrentUser } from "@/lib/auth"; // your custom helper (or import from wherever you store session)
import PremiumHeader from "@/components/layout/PremiumHeader";
import PremiumFooter from "@/components/layout/PremiumFooter";
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const user =  await getCurrentUser();

  return (
      <div className="min-h-screen bg-stone-50 text-neutral-950">
    <PremiumHeader
     user={user} />
        <div>{children}</div>
        <PremiumFooter />
      </div>
  );
}
