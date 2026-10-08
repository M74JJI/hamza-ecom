import { getCurrentUser } from "@/lib/auth";
import { DashboardHeaderClient } from "./DashboardHeaderClient";
export const dynamic = "force-dynamic";

export async function DashboardHeader({
  from,
  to,
  exportButton,
}: {
  from?: Date;
  to?: Date;
  exportButton?: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;

  return <DashboardHeaderClient user={user} from={from} to={to} exportButton={exportButton} />;
}
