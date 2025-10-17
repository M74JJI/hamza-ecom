import { ReactNode } from "react";
import { requireAdmin } from "@/lib/require-admin";
import './globals.css'
export default async function Layout({ children }:{children: ReactNode}){
  return (
   <html lang="en">
        <body className="">
  {children}
        </body>
      </html>
  );
}
