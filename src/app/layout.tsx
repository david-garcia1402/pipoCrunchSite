import type { Metadata } from "next";
import { Cinzel, Great_Vibes, Outfit } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} | Pipocas gourmet em Jaraguá do Sul`,
  description: site.description,
  openGraph: {
    title: `${site.name} | Pipocas gourmet`,
    description: site.description,
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${cinzel.variable} ${greatVibes.variable}`}
    >
      <body className={`${outfit.className} antialiased`}>{children}</body>
    </html>
  );
}
