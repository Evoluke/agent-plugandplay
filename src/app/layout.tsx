// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description =
  "A Evoluke oferece soluções de CRM integradas com inteligência artificial, personalizando atendimentos e automatizando processos para empresas.";

export const metadata: Metadata = {
  title: "Evoluke",
  description,
  robots: { index: true, follow: true },
  openGraph: {
    title: "Evoluke",
    description,
    url: "https://evoluke.com.br",
    siteName: "Evoluke",
    images: [
      {
        url: "/logo.png",
        alt: "Evoluke",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Evoluke",
    description,
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${geistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-sans antialiased h-full">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
