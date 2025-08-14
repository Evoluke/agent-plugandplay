"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { supabasebrowser } from "@/lib/supabaseClient";

export default function AgentGuide() {
  const params = useParams();
  const id = params?.id as string;
  const [introOpen, setIntroOpen] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabasebrowser.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const stored = localStorage.getItem(`agentIntroOpen_${userId}`);
    if (stored !== null) {
      setIntroOpen(stored === "true");
    }
  }, [userId]);

  const handleIntroOpenChange = (open: boolean) => {
    setIntroOpen(open);
    if (userId) {
      localStorage.setItem(`agentIntroOpen_${userId}`, String(open));
    }
  };

  return (
    <>
      <Dialog.Root open={introOpen} onOpenChange={handleIntroOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow space-y-4">
            <Dialog.Title className="text-lg font-semibold">
              Configuração do agente
            </Dialog.Title>
            <div className="text-sm space-y-2">
              <p>Configure o agente seguindo as etapas:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>Base de conhecimento</strong>: adicione arquivos, links, FAQs e vídeos que servirão de referência.
                  <Button variant="link" asChild className="px-1">
                    <Link href={`/dashboard/agents/${id}/base-conhecimento`}>
                      Ir para base de conhecimento
                    </Link>
                  </Button>
                </li>
                <li>
                  <strong>Comportamento</strong>: defina tom de voz, objetivo e limites de atuação.
                  <Button variant="link" asChild className="px-1">
                    <Link href={`/dashboard/agents/${id}/comportamento`}>
                      Ir para comportamento
                    </Link>
                  </Button>
                </li>
                <li>
                  <strong>Instruções específicas</strong>: detalhe orientações e casos especiais.
                  <Button variant="link" asChild className="px-1">
                    <Link href={`/dashboard/agents/${id}/instrucoes-especificas`}>
                      Ir para instruções específicas
                    </Link>
                  </Button>
                </li>
                <li>
                  <strong>Onboarding</strong>: personalize a primeira interação com usuários.
                  <Button variant="link" asChild className="px-1">
                    <Link href={`/dashboard/agents/${id}/onboarding`}>
                      Ir para onboarding
                    </Link>
                  </Button>
                </li>
              </ul>
              <p className="text-xs text-gray-500">
                Siga a sequência acima para configurar o agente. Atualize este texto caso novas funcionalidades sejam adicionadas.
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => handleIntroOpenChange(false)}
              >
                Minimizar
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {!introOpen && (
        <Button
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
          onClick={() => handleIntroOpenChange(true)}
        >
          Guia
        </Button>
      )}
    </>
  );
}

