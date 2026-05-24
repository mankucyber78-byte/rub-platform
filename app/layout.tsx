import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "RUB — Represent Your Business",
  description:
    "AI redesigns your WordPress website in minutes. Frontend only. $49.99 one-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        className={`${dmSans.variable} ${playfair.variable} min-h-full flex flex-col bg-[#080B10] font-[family-name:var(--font-dm-sans)] text-white antialiased`}
      >
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
