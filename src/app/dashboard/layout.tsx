import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zanki | Finance App",
  description: "",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    {children}
    </>
  );
}
