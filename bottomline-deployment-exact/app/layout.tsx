import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StrategyProvider } from "@/lib/strategyStore";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DealOS Deal Workspace",
  description: "Bottomline Payer Pricing Operating System deal workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-[#f6f7f9] text-slate-800`}>
        <StrategyProvider>{children}</StrategyProvider>
      </body>
    </html>
  );
}
