import "../globals.css";
import { getCurrentUser } from "@/lib/auth"; // your custom helper (or import from wherever you store session)
import "@/styles/hz-premium.css";
import PremiumHeader from "@/components/layout/PremiumHeader";
import PremiumFooter from "@/components/layout/PremiumFooter";
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const user =  await getCurrentUser();

  return (
      <div className="">
    <PremiumHeader
     user={user} />
        <div className="">{children}</div>
        <PremiumFooter />
      </div>
  );
}
