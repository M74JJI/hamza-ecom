import { getSessionUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export async function requireAdmin(){
  const user = await getSessionUser();
  if(!user || user.role !== "ADMIN"){
    redirect("/");
  }
  return user;
}
