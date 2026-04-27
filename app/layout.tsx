import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { landingContent } from "@/data/landing-content";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-main",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://paini.grifmaster.ru"),
  title: landingContent.meta.title,
  description: landingContent.meta.description,
  openGraph: {
    title: landingContent.meta.openGraph.title,
    description: landingContent.meta.openGraph.description,
    type: landingContent.meta.openGraph.type as "website",
    locale: landingContent.meta.openGraph.locale,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body className={manrope.variable}>{children}</body>
    </html>
  );
}
