import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beacon — On-chain reputation on Solana",
  description:
    "Beacon is a soulbound attestation protocol on Solana. Issue, verify, and revoke on-chain credentials with a live reputation graph.",
  metadataBase: new URL("https://beacon.so"),
  openGraph: {
    title: "Beacon",
    description: "On-chain reputation, verifiable by anyone, owned by no one.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased font-sans grain">
        {children}
      </body>
    </html>
  );
}
