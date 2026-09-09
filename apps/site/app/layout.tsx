import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MONARK",
  description:
    "MONARK — a company of agent-products on one coverage-controlled gate that emits commit, defer, or abstain, and a depletable authorization budget.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="font-sans">
      <body>{children}</body>
    </html>
  );
}
