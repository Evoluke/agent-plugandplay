"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    chatwootSettings?: {
      hideMessageBubble: boolean;
      position: string;
      type: string;
    };
    chatwootSDK: {
      run: (options: { websiteToken: string; baseUrl: string }) => void;
    };
    $chatwoot: {
      toggleBubbleVisibility: (state: "show" | "hide") => void;
    };
  }
}

// Hide the widget on authentication routes
const BLOCK = ["/login", "/signup", "/dashboard", "/forgot-password", "/complete-profile", "/verify-email" ];

const isBlocked = (path: string) => BLOCK.some((p) => path.startsWith(p));

export default function ChatwootController() {
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const BASE_URL = "https://platform.tracelead.com.br";
    const TOKEN = "EioqiGzk1toeBkQgLiRNxMuG";

    window.chatwootSettings = { hideMessageBubble: false, position: "right", type: "standard" };

    const apply = () => {
      const path = window.location.pathname;
      const ok = !isBlocked(path);
      const bubble = document.querySelector(".woot-widget-bubble");
      if (bubble && window.$chatwoot) {
        window.$chatwoot.toggleBubbleVisibility(ok ? "show" : "hide");
      }
    };

    window.addEventListener("chatwoot:ready", apply, { once: true });

    const g = document.createElement("script");
    g.src = `${BASE_URL}/packs/js/sdk.js`;
    g.defer = true;
    g.async = true;
    g.onload = function () {
      window.chatwootSDK.run({ websiteToken: TOKEN, baseUrl: BASE_URL });
      if (window.$chatwoot) apply();
    };
    document.head.appendChild(g);
  }, []);

  useEffect(() => {
    const ok = !isBlocked(pathname);
    const w = window;
    const bubble = document.querySelector(".woot-widget-bubble");
    if (w.$chatwoot && bubble) {
      w.$chatwoot.toggleBubbleVisibility(ok ? "show" : "hide");
    } else {
      const fn = () => {
        const b = document.querySelector(".woot-widget-bubble");
        if (b) w.$chatwoot.toggleBubbleVisibility(ok ? "show" : "hide");
      };
      window.addEventListener("chatwoot:ready", fn, { once: true });
      return () => window.removeEventListener("chatwoot:ready", fn);
    }
  }, [pathname]);

  return null;
}

