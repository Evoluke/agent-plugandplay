// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description =
  "Agent Plug and Play é uma plataforma de agentes de inteligência artificial plug and play para automação, chatbots e integrações sem código.";

export const metadata: Metadata = {
  title: "Agent Plug and Play",
  description,
  robots: { index: true, follow: true },
  openGraph: {
    title: "Agent Plug and Play",
    description,
    url: "https://agent-plugandplay.com",
    siteName: "Agent Plug and Play",
    images: [
      {
        url: "/logo.svg",
        alt: "Agent Plug and Play",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Plug and Play",
    description,
    images: ["/logo.svg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <Toaster position="top-right"/>
        {children}
      </body>
    </html>
  );
}
