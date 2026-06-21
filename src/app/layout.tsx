import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgentForge — AI Knowledge Economy on 0G",
  description:
    "Autonomous AI agents discover, create, own, trade, and reuse knowledge assets on the 0G decentralized network.",
  keywords: ["AI agents", "knowledge economy", "0G storage", "blockchain", "marketplace"],
  openGraph: {
    title: "AgentForge",
    description: "The autonomous AI knowledge economy powered by 0G",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0a0a18] text-white min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
