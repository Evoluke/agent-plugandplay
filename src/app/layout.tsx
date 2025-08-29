// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";

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
        <Script id="chatwoot-loader" strategy="afterInteractive">
          {`
            (function (d, t) {
              var allowed = ["/", "/contact", "/pricing"];
              var path = location.pathname;
              var show = allowed.some(function (p) {
                return path === p || path.startsWith(p + "/");
              });
              if (!show) return;

              var BASE_URL = "https://platform.tracelead.com.br";
              var g = d.createElement(t), s = d.getElementsByTagName(t)[0];
              g.src = BASE_URL + "/packs/js/sdk.js";
              g.defer = true; g.async = true;
              s.parentNode.insertBefore(g, s);
              g.onload = function () {
                window.chatwootSDK.run({
                  websiteToken: "EioqiGzk1toeBkQgLiRNxMuG",
                  baseUrl: BASE_URL
                });
              };
            })(document, "script");
          `}
        </Script>
      </body>
    </html>
  );
}
