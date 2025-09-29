// src/app/layout.tsx

import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ChatwootController from "@/components/ChatwootController";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description =
  "A Evoluke oferece soluções de CRM integradas com inteligência artificial, personalizando atendimentos e automatizando processos para empresas.";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://evoluke.com.br";

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Evoluke",
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  description,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["Portuguese"],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Evoluke | CRM com IA para atendimento omnicanal",
    template: "%s | Evoluke",
  },
  description,
  keywords: [
    "CRM com IA",
    "atendimento omnicanal",
    "automação de vendas",
    "chatbot inteligente",
    "gestão de relacionamento com clientes",
  ],
  robots: { index: true, follow: true },
  category: "technology",
  creator: "Evoluke",
  publisher: "Evoluke",
  openGraph: {
    title: "Evoluke | CRM com IA para atendimento omnicanal",
    description,
    url: baseUrl,
    siteName: "Evoluke",
    images: [
      {
        url: `${baseUrl}/logo.png`,
        alt: "Logotipo da Evoluke",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Evoluke | CRM com IA para atendimento omnicanal",
    description,
    images: [`${baseUrl}/logo.png`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${geistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="google-adsense-account" content="ca-pub-9486959611066829" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          id="evoluke-organization-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData).replace(/</g, "\\u003c"),
          }}
        />
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '3219137398253344');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased h-full">
        <NotificationProvider>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src="https://www.facebook.com/tr?id=3219137398253344&ev=PageView&noscript=1"
            />
          </noscript>
          <Toaster position="top-right" />
          {children}
          <ChatwootController />
        </NotificationProvider>
      </body>
    </html>
  );
}
