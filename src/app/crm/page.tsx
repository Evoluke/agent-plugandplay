"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function CrmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;
    const createCrm = async () => {
      try {
        const res = await fetch("/api/crm/create", { method: "POST" });
        if (!res.ok) throw new Error();
        await res.json().catch(() => ({}));
        router.replace("/dashboard");
      } catch {
        setStatus("error");
      }
    };
    createCrm();
  }, [router]);

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

  return null;
}
