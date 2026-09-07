import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans-stack" });
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

// Locked scale — this is an app, not a document. Content still reflows on
// small screens, so text stays readable without pinch-zoom.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafb" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d12" },
  ],
};

// Set the stored theme before first paint to avoid a flash.
const themeInit = `try{var t=localStorage.getItem('grid-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
    >
      <head>
        <script>{themeInit}</script>
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
