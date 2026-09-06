import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-stack",
});
const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif-stack",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-stack",
});

export const metadata: Metadata = {
  title: "GRID Banking",
  description: "A clearer bank. Good today, good tomorrow, good future.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
