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

const ALLOW = ["/contato", "/orcamento"];

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
      const ok = ALLOW.some((p) => path.startsWith(p));
      window.$chatwoot.toggleBubbleVisibility(ok ? "show" : "hide");
    };

    window.addEventListener("chatwoot:ready", apply, { once: true });

    (function (d: Document, t: string) {
      const g = d.createElement(t) as HTMLScriptElement;
      const s = d.getElementsByTagName(t)[0]!;
      g.src = `${BASE_URL}/packs/js/sdk.js`;
      g.defer = true;
      g.async = true;
      s.parentNode!.insertBefore(g, s);
      g.onload = function () {
        window.chatwootSDK.run({ websiteToken: TOKEN, baseUrl: BASE_URL });
        if (window.$chatwoot) apply();
      };
    })(document, "script");
  }, []);

  useEffect(() => {
    const ok = ALLOW.some((p) => pathname.startsWith(p));
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

