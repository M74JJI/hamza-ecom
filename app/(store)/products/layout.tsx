import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
};

export default function ProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
