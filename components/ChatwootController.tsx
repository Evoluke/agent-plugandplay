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

// Render the widget only on these routes. Include "/" for just the landing page.
const ALLOW = ["/"];

const isAllowed = (path: string) =>
  ALLOW.some((p) => (p === "/" ? path === "/" : path.startsWith(p)));

export default function ChatwootController() {
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const BASE_URL = "https://platform.tracelead.com.br";
    const TOKEN = "EioqiGzk1toeBkQgLiRNxMuG";

    window.chatwootSettings = { hideMessageBubble: true, position: "right", type: "standard" };

    const apply = () => {
      const path = window.location.pathname;
      const ok = isAllowed(path);
      window.$chatwoot.toggleBubbleVisibility(ok ? "show" : "hide");
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
    const ok = isAllowed(pathname);
    const w = window;
    if (w.$chatwoot) {
      w.$chatwoot.toggleBubbleVisibility(ok ? "show" : "hide");
    } else {
      const fn = () => w.$chatwoot.toggleBubbleVisibility(ok ? "show" : "hide");
      window.addEventListener("chatwoot:ready", fn, { once: true });
      return () => window.removeEventListener("chatwoot:ready", fn);
    }
  }, [pathname]);

  return null;
}

