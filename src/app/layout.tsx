import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LazyPersonsGuideModal from "@/components/layout/LazyPersonsGuideModal";

// Configure font optimization
const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SDG Buddy | Sustainable Action Tracker Platform",
  description: "A platform designed to help individuals align their daily actions with the united nation sustainable development goals (UNSDGs).",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        {children}
        <LazyPersonsGuideModal />
      </body>
    </html>
  );
}