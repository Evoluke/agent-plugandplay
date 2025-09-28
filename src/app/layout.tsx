// src/app/layout.tsx

import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description =
  "Construa currículos profissionais com IA, exporte em PDF e DOCX, otimize para ATS e personalize versões por vaga com poucos cliques.";

export const metadata: Metadata = {
  title: "Currículo IA Pro",
  description,
  robots: { index: true, follow: true },
  openGraph: {
    title: "Currículo IA Pro",
    description,
    url: "https://curriculo-ia.pro",
    siteName: "Currículo IA Pro",
    images: [
      {
        url: "/logo.png",
        alt: "Currículo IA Pro",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Currículo IA Pro",
    description,
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html lang="pt-BR" className={`${inter.variable} ${geistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {adsenseClient ? (
          <Script
            id="google-adsense"
            data-ad-client={adsenseClient}
            strategy="afterInteractive"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className="font-sans antialiased h-full">
        <NotificationProvider>
          <Toaster position="top-right" />
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
