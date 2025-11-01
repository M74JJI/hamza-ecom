import { getSessionUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export async function requireUser(){
  const user = await getSessionUser();
  if(!user){
    redirect("/signin");
  }
  return { user };
}


