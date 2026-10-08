import { ReactNode } from "react";
import type { Metadata } from "next";
import './globals.css'

export const metadata: Metadata = {
  title: "HAMZA Store",
  description: "HAMZA online store",
  icons: { icon: "/brand/hamza-logo.png", apple: "/brand/hamza-logo.png" },
};

export default async function Layout({ children }:{children: ReactNode}){
  return (
   <html lang="en">
        <body className="">
  {children}
        </body>
      </html>
  );
}
