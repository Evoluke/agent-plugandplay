"use client";

import { useEffect } from "react";

type AdSlotProps = {
  slot: string;
  format?: "auto" | "fluid" | "rectangle";
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: { push: (config?: Record<string, unknown>) => void }[];
  }
}

export function AdSlot({ slot, format = "auto", className }: AdSlotProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("Falha ao inicializar Google AdSense", error);
      }
    }
  }, []);

  if (!process.env.NEXT_PUBLIC_ADSENSE_ID) {
    return null;
  }

  return (
    <ins
      className={`adsbygoogle block w-full ${className ?? ""}`.trim()}
      style={{ display: "block" }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

export default AdSlot;
