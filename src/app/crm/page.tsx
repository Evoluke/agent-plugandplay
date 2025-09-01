"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CrmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [crmUrl, setCrmUrl] = useState<string | null>(null);

  useEffect(() => {
    const createCrm = async () => {
      try {
        const res = await fetch("/api/crm/create", { method: "POST" });
        if (!res.ok) throw new Error();
        const data = await res.json().catch(() => ({}));
        if (data.crm_url) setCrmUrl(data.crm_url);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };
    createCrm();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Estamos preparando tudo...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-center">
        <p>Identificamos um erro ao criar seu CRM. Já estamos verificando e em breve você terá acesso normalmente.</p>
        <Button onClick={() => router.replace("/dashboard")}>Seguir para plataforma</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-center">
      <p>Seu CRM está criado!</p>
      <Button
        onClick={() => {
          if (crmUrl) window.open(crmUrl, "_blank");
          router.replace("/dashboard");
        }}
      >
        Abrir CRM
      </Button>
    </div>
  );
}
