"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import { FileText, PlayCircle } from "lucide-react";

type DocumentationResource = {
  label: string;
  href: string;
};

type DocumentationItem = {
  id: string;
  title: string;
  description?: string;
  body?: string[];
  videoUrl?: string;
  resources?: DocumentationResource[];
};

type DocumentationSection = {
  id: string;
  title: string;
  description?: string;
  items: DocumentationItem[];
};

const documentationSections: DocumentationSection[] = [
  {
    id: "getting-started",
    title: "Primeiros passos",
    description: "Conheça as áreas essenciais da plataforma e configure sua conta.",
    items: [
      {
        id: "overview",
        title: "Visão geral do dashboard",
        description: "Tour rápido pelas principais métricas e atalhos.",
        videoUrl: "https://www.youtube.com/embed/Wch3gJG2GJ4",
        body: [
          "Aprenda a navegar pelo dashboard para acompanhar o desempenho dos seus agentes de IA.",
          "A visão geral apresenta os indicadores mais importantes, atalhos para seções críticas e notificações do sistema.",
          "Utilize o menu lateral para alternar entre agentes, acessar a área de pagamentos e abrir o suporte sempre que precisar.",
        ],
      },
      {
        id: "first-agent",
        title: "Criando seu primeiro agente",
        description: "Passo a passo para criar um agente do zero.",
        body: [
          "Clique em \"Agentes IA\" na barra lateral e selecione \"Criar novo agente\" para iniciar a configuração.",
          "Defina a personalidade, comportamento, onboarding e base de conhecimento para alinhar o agente com a sua operação.",
          "Finalize revisando o resumo e ativando o agente para disponibilizá-lo nos canais desejados.",
        ],
        resources: [
          {
            label: "Checklist de configuração do agente",
            href: "https://docs.google.com/document/d/1bChecklistAgent",
          },
        ],
      },
    ],
  },
  {
    id: "knowledge-base",
    title: "Base de conhecimento",
    description: "Organize conteúdos que ajudam a IA a responder com precisão.",
    items: [
      {
        id: "files",
        title: "Gerenciando arquivos",
        description: "Como subir, validar e remover documentos.",
        body: [
          "Aceitamos arquivos em formato PDF e TXT com até 10MB. Outros formatos serão rejeitados automaticamente.",
          "O sistema estima a quantidade de tokens para manter o agente dentro dos limites suportados. Utilize documentos objetivos para otimizar o uso.",
          "Caso precise atualizar um arquivo, faça o upload da nova versão e remova a antiga para evitar conteúdo duplicado.",
        ],
      },
      {
        id: "faq",
        title: "Criando respostas rápidas",
        description: "Construa uma biblioteca de respostas frequentes.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        body: [
          "Organize as respostas rápidas por categoria para facilitar a manutenção conforme novas dúvidas surgirem.",
          "Reforce palavras-chave e links úteis em cada resposta para orientar os usuários durante a conversa.",
          "Revise o conteúdo periodicamente para garantir que esteja alinhado com processos e políticas atualizadas.",
        ],
        resources: [
          {
            label: "Modelo de planilha para respostas rápidas",
            href: "https://docs.google.com/spreadsheets/d/1bFaqTemplate",
          },
        ],
      },
    ],
  },
  {
    id: "automation",
    title: "Fluxos e integrações",
    description: "Conecte o agente com ferramentas externas e automatize tarefas.",
    items: [
      {
        id: "crm",
        title: "Integrando com o CRM",
        description: "Como habilitar o acesso ao Chatwoot.",
        body: [
          "Na seção de Configuração informe o identificador do seu workspace no Chatwoot para habilitar o atalho direto no menu.",
          "Ao clicar em CRM na barra lateral abriremos o Chatwoot em uma nova aba utilizando SSO. Garanta que o usuário tenha permissões válidas.",
          "Caso o acesso falhe, verifique as credenciais configuradas e tente novamente após alguns minutos.",
        ],
      },
      {
        id: "webhooks",
        title: "Conectando webhooks",
        description: "Dispare automações externas a partir das conversas.",
        body: [
          "Utilize os webhooks para enviar eventos do agente para o seu sistema de automações favorito.",
          "Você pode disparar ações ao receber novos leads, quando uma conversa é encerrada ou ao detectar palavras-chave específicas.",
          "Sempre teste os webhooks em um ambiente de homologação antes de ativá-los em produção.",
        ],
        resources: [
          {
            label: "Guia de eventos disponíveis",
            href: "https://docs.google.com/document/d/1bWebhookEvents",
          },
        ],
      },
    ],
  },
];

export default function DocumentationPage() {
  const allItems = useMemo(
    () => documentationSections.flatMap((section) => section.items),
    []
  );

  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    allItems[0]?.id ?? null
  );

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    for (const section of documentationSections) {
      const item = section.items.find((i) => i.id === selectedItemId);
      if (item) return item;
    }
    return null;
  }, [selectedItemId]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Documentação</h1>
        <p className="text-sm text-gray-600">
          Explore guias, vídeos e materiais de apoio para configurar e evoluir seus agentes.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="lg:hidden">
          <Select
            value={selectedItemId ?? undefined}
            onValueChange={(value) => setSelectedItemId(value)}
          >
            <SelectTrigger aria-label="Selecionar tópico">
              <SelectValue placeholder="Navegue pelos tópicos" />
            </SelectTrigger>
            <SelectContent className="max-h-[60vh] min-w-[280px]">
              {documentationSections.map((section) => (
                <div key={section.id} className="py-1">
                  <p className="px-2 pb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-gray-400">
                    {section.title}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </div>
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        <aside className="hidden space-y-6 self-start lg:sticky lg:top-24 lg:block">
          {documentationSections.map((section) => (
            <section key={section.id} className="space-y-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {section.title}
                </h2>
                {section.description ? (
                  <p className="mt-1 text-xs text-gray-500">
                    {section.description}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-left transition",
                      "hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F68]",
                      selectedItemId === item.id
                        ? "border-[#2F6F68] bg-[#F0F5F4] text-gray-900"
                        : "border-transparent bg-white text-gray-600",
                    )}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-[#2F6F68]">
                        {item.videoUrl ? (
                          <PlayCircle className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-snug">
                          {item.title}
                        </p>
                        {item.description ? (
                          <p className="text-xs text-gray-500">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </aside>

        <section>
          {selectedItem ? (
            <Card className="overflow-hidden">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {selectedItem.title}
                </CardTitle>
                {selectedItem.description ? (
                  <p className="text-sm text-gray-600">
                    {selectedItem.description}
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedItem.videoUrl ? (
                  <div className="aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-black/5">
                    <iframe
                      src={selectedItem.videoUrl}
                      title={selectedItem.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : null}

                {selectedItem.body?.length ? (
                  <div className="space-y-4 text-sm leading-relaxed text-gray-700">
                    {selectedItem.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}

                {selectedItem.resources?.length ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Recursos adicionais
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {selectedItem.resources.map((resource) => (
                        <li key={resource.href}>
                          <a
                            href={resource.href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0E4DE0] transition hover:underline"
                          >
                            {resource.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-sm text-gray-500">
                Selecione um tópico na lista ao lado para visualizar o conteúdo.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
