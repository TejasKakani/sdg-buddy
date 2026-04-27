import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import "./globals.css";

// Configure font optimization
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SDG Buddy | Sustainable Action Tracker Platform",
  description: "A platform designed to help individuals align their daily actions with the united nation sustainable development goals (UNSDGs).",
  manifest: "/manifest.webmanifest",
  themeColor: "#10b981",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}