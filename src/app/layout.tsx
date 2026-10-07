import type { Metadata, Viewport } from "next";
import { Mitr, Thasadith } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const mitr = Mitr({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mitr",
  display: "swap",
});

const thasadith = Thasadith({
  subsets: ["latin", "thai"],
  weight: ["400", "700"],
  variable: "--font-thasadith",
  display: "swap",
});

export const metadata: Metadata = {
  title: "justHomePage",
  description: "A fast personal browser homepage.",
  applicationName: "justHomePage",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f5f7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(mitr.variable, thasadith.variable)}>
      <body>{children}</body>
    </html>
  );
}
