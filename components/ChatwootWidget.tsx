"use client";
import { useEffect } from "react";

export default function ChatwootWidget() {
  useEffect(() => {
    const BASE_URL = "https://platform.tracelead.com.br";
    const TOKEN = "EioqiGzk1toeBkQgLiRNxMuG";

    (function (d: Document, t: string) {
      const g = d.createElement(t), s = d.getElementsByTagName(t)[0]!;
      g.setAttribute("src", `${BASE_URL}/packs/js/sdk.js`);
      (g as HTMLScriptElement).defer = true;
      (g as HTMLScriptElement).async = true;
      s.parentNode!.insertBefore(g, s);
      (g as HTMLScriptElement).onload = function () {
        // @ts-expect-error chatwoot sdk types missing
        window.chatwootSDK.run({ websiteToken: TOKEN, baseUrl: BASE_URL });
      };
    })(document, "script");

    // Ao sair da página, opcional: esconder o balão
    return () => {
      // @ts-expect-error chatwoot bubble helper
      if (window.$chatwoot) window.$chatwoot.toggleBubbleVisibility("hide");
    };
  }, []);

  return null;
}
