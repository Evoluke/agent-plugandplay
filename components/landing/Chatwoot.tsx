"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    chatwootSDK?: {
      run: (options: { websiteToken: string; baseUrl: string }) => void;
    };
  }
}

export default function Chatwoot() {
  useEffect(() => {
    const BASE_URL = "https://platform.tracelead.com.br";
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

    return () => {
      document.getElementById("chatwoot-sdk")?.remove();
      document.getElementById("chatwoot-widget-container")?.remove();
      document.getElementById("chatwoot-widget-button")?.remove();
      delete window.chatwootSDK;
    };
  }, []);

  return null;
}

