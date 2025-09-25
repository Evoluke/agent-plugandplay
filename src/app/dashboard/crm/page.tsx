"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const DEFAULT_ERROR_MESSAGE =
  "Não foi possível carregar o CRM agora. Tente novamente em instantes.";

type CrmState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

export default function DashboardCrmPage() {
  const [state, setState] = useState<CrmState>({ status: "loading" });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchSsoUrl = async () => {
      setState({ status: "loading" });
      try {
        const response = await fetch("/api/chatwoot/sso");
        if (!active) return;

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          setState({
            status: "error",
            message: data?.error || DEFAULT_ERROR_MESSAGE,
          });
          return;
        }

        const data = (await response.json().catch(() => null)) as
          | { url?: string }
          | null;

        if (!active) return;

        if (!data?.url) {
          setState({ status: "error", message: DEFAULT_ERROR_MESSAGE });
          return;
        }

        setState({ status: "ready", url: data.url });
      } catch (error) {
        if (!active) return;
        console.error("[CRM] Falha ao carregar SSO do Chatwoot", error);
        setState({ status: "error", message: DEFAULT_ERROR_MESSAGE });
      }
    };

    void fetchSsoUrl();

    return () => {
      active = false;
    };
  }, [reloadCount]);

  const handleReload = () => setReloadCount((count) => count + 1);

  let content: ReactNode;
  if (state.status === "ready") {
    content = (
      <iframe
        key={state.url}
        src={state.url}
        title="CRM Evoluke"
        className="h-full w-full"
        allow="camera; microphone; clipboard-read; clipboard-write"
      />
    );
  } else if (state.status === "loading") {
    content = (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center text-sm text-gray-600">
        <Loader2 className="h-6 w-6 animate-spin text-[#2F6F68]" />
        <p>Conectando com o CRM...</p>
      </div>
    );
  } else {
    content = (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center text-sm text-gray-600">
        <p>{state.message}</p>
        <Button onClick={handleReload}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">CRM Evoluke</h1>
        <p className="text-sm text-gray-600">
          Centralize os atendimentos do Chatwoot sem sair da plataforma.
        </p>
      </header>
      <div className="flex-1 overflow-hidden rounded-lg border bg-white">{content}</div>
    </div>
  );
}
