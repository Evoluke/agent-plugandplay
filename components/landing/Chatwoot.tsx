"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    chatwootSDK?: {
      run: (options: { websiteToken: string; baseUrl: string }) => void;
    };
    chatwoot?: unknown;
    $chatwoot?: unknown;
    chatwootSettings?: unknown;
  }
}

export default function Chatwoot() {
  useEffect(() => {
    const BASE_URL = "https://platform.tracelead.com.br";
    if (!document.getElementById("chatwoot-sdk")) {
      const script = document.createElement("script");
      script.src = `${BASE_URL}/packs/js/sdk.js`;
      script.async = true;
      script.defer = true;
      script.id = "chatwoot-sdk";
      document.body.appendChild(script);

      script.onload = () => {
        window.chatwootSDK?.run({
          websiteToken: "EioqiGzk1toeBkQgLiRNxMuG",
          baseUrl: BASE_URL,
        });
      };
    }

    return () => {
      document.getElementById("chatwoot-sdk")?.remove();
      document.querySelectorAll("[id^='chatwoot'], [class*='woot-widget']").forEach((el) => el.remove());
      delete window.chatwootSDK;
      delete window.chatwoot;
      // @ts-expect-error: $chatwoot is injected by Chatwoot SDK
      delete window.$chatwoot;
      delete window.chatwootSettings;
    };
  }, []);

  return null;
}

