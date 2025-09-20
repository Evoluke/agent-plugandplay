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
import { FileText, Menu, PlayCircle } from "lucide-react";

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
        id: "first-agent",
        title: "Criando seu primeiro agente",
        description: "Passo a passo para criar um agente do zero.",
        body: [
          "Clique em \"Agentes IA\" na barra lateral e selecione \"Criar novo agente\" para iniciar a configuração.",
          "Na etapa de detalhes informe nome interno, nome público, tipo do agente e canais em que ele ficará disponível; essas informações aparecem em toda a plataforma e ajudam a equipe a identificar o agente.",
          "Personalize a personalidade e o roteiro inicial definindo tom de voz, mensagem de boas-vindas, instruções de encerramento e regras de transferência para humanos, garantindo um atendimento consistente.",
          "Em comportamentos configure horários de atuação, limites de conversas simultâneas e prioridades de filas para que o agente saiba quando responder, pausar ou escalar um contato.",
          "Na Base de conhecimento conecte artigos, documentos e FAQs: o agente de IA utiliza esse conteúdo como fonte de verdade para gerar respostas contextuais, buscando trechos relevantes a cada pergunta do usuário.",
          "Defina as Variáveis de coleta — disponíveis para os agentes SDR e Pré-qualificação — indicando quais dados obrigatórios (como nome, e-mail, empresa ou orçamento) devem ser solicitados; a IA valida cada campo com o lead antes de prosseguir para a próxima etapa.",
          "Configure a Integração com calendário, habilitada para o agente SDR, apontando a agenda e os horários permitidos; quando o lead está qualificado, o agente oferece os slots livres e agenda automaticamente o compromisso.",
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

type DocumentationMenuButtonProps = {
  item: DocumentationItem;
  isActive: boolean;
  onSelect: (itemId: string) => void;
};

function DocumentationMenuButton({
  item,
  isActive,
  onSelect,
}: DocumentationMenuButtonProps) {
  const Icon = item.videoUrl ? PlayCircle : FileText;
  const baseClasses = "rounded-lg border px-3 py-2";
  const stateClasses = isActive
    ? "border-[#2F6F68] bg-[#F0F5F4] text-gray-900 shadow-sm"
    : "border-transparent text-gray-600 hover:bg-gray-50";
  const layoutClasses = "items-start gap-3";
  const iconWrapperClasses = "mt-0.5 text-[#2F6F68]";

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-pressed={isActive}
      className={cn(
        "flex w-full text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F68]",
        layoutClasses,
        baseClasses,
        stateClasses
      )}
    >
      <span className={iconWrapperClasses}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="space-y-1">
        <span className="block text-sm font-medium leading-snug">
          {item.title}
        </span>
        {item.description ? (
          <span className="block text-xs text-gray-500">{item.description}</span>
        ) : null}
      </span>
    </button>
  );
}

export default function DocumentationPage() {
  const allItems = useMemo(
    () => documentationSections.flatMap((section) => section.items),
    []
  );

  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(
    allItems[0]?.id
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

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <nav className="lg:hidden" aria-label="Navegação da documentação">
          <Select
            value={selectedItemId}
            onValueChange={(value) => setSelectedItemId(value)}
          >
            <SelectTrigger
              className="w-full"
              aria-label="Selecionar tópico da documentação"
            >
              <span className="flex flex-1 items-center gap-2">
                <Menu className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <SelectValue placeholder="Selecione um tópico" />
              </span>
            </SelectTrigger>
            <SelectContent className="max-h-64 overflow-y-auto">
              {documentationSections.map((section) => (
                <div key={section.id}>
                  <p className="px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-wide text-gray-500">
                    {section.title}
                  </p>
                  {section.items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </nav>

        <aside className="hidden lg:block" aria-label="Navegação da documentação">
          <div className="sticky top-24">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {documentationSections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className={cn(
                    "border-gray-100",
                    sectionIndex < documentationSections.length - 1
                      ? "border-b"
                      : "border-b-0"
                  )}
                >
                  <div className="bg-gray-50 px-4 py-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {section.title}
                    </h2>
                  </div>
                  <div className="space-y-1 px-3 py-3">
                    {section.items.map((item) => (
                      <DocumentationMenuButton
                        key={item.id}
                        item={item}
                        isActive={selectedItemId === item.id}
                        onSelect={(id) => setSelectedItemId(id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
