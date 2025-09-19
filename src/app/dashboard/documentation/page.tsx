"use client";

import { useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DocResource {
  label: string;
  href: string;
}

interface DocTopic {
  id: string;
  title: string;
  summary: string;
  content: string[];
  videoUrl?: string;
  resources?: DocResource[];
}

interface DocSection {
  id: string;
  title: string;
  topics: DocTopic[];
}

const documentation: DocSection[] = [
  {
    id: "getting-started",
    title: "Primeiros passos",
    topics: [
      {
        id: "overview",
        title: "Visão geral da plataforma",
        summary:
          "Entenda como a Evoluke conecta seus agentes de IA aos canais de atendimento e automatiza respostas.",
        content: [
          "A Evoluke foi criada para centralizar o atendimento automatizado em um único painel. Nesta visão geral, destacamos os principais blocos do dashboard para que você saiba onde encontrar métricas, configurações e ferramentas de suporte.",
          "Utilize o menu lateral esquerdo para navegar entre pagamentos, configurações e agora a documentação com guias que auxiliam no dia a dia da operação.",
        ],
      },
      {
        id: "tour-video",
        title: "Tour guiado em vídeo",
        summary:
          "Assista a um passo a passo rápido mostrando as principais áreas da plataforma e como personalizar um agente.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        content: [
          "Enquanto assiste, faça pausas para replicar os passos na sua conta. Você pode voltar ao começo a qualquer momento selecionando novamente este tópico no menu lateral.",
        ],
        resources: [
          { label: "Checklist de implementação", href: "https://example.com/checklist" },
        ],
      },
    ],
  },
  {
    id: "agent-setup",
    title: "Configuração de agentes",
    topics: [
      {
        id: "knowledge-base",
        title: "Base de conhecimento",
        summary:
          "Aprenda a organizar os materiais que alimentam o agente e mantenha sua base sempre atualizada.",
        content: [
          "Acesse o menu de agentes para selecionar qual robô deseja editar e utilize a aba de Base de Conhecimento para anexar arquivos ou adicionar trechos de texto.",
          "Separe os conteúdos por assunto e utilize tags para facilitar futuras atualizações. Nosso sistema aceita arquivos PDF, Word e planilhas, além de notas rápidas via editor de texto.",
        ],
      },
      {
        id: "channels",
        title: "Conexão com canais",
        summary:
          "Integre seus canais favoritos como WhatsApp, Instagram Direct e webchat em poucos minutos.",
        videoUrl: "https://www.youtube.com/embed/TcMBFSGVi1c",
        content: [
          "Para conectar um novo canal, acesse Configurações › Canais e clique em “Adicionar conexão”. Cada integração possui instruções específicas e, quando necessário, um fluxo de autenticação guiado.",
          "Caso encontre alguma dificuldade, utilize os materiais complementares e entre em contato com o suporte diretamente pelo dashboard.",
        ],
        resources: [
          { label: "Documentação oficial do WhatsApp Business", href: "https://developers.facebook.com/docs/whatsapp" },
          { label: "Guia de conexão com Instagram", href: "https://example.com/instagram-guide" },
        ],
      },
    ],
  },
  {
    id: "best-practices",
    title: "Boas práticas",
    topics: [
      {
        id: "metrics",
        title: "Acompanhamento de métricas",
        summary:
          "Compreenda os indicadores disponíveis e defina metas para seus agentes conversacionais.",
        content: [
          "O painel de métricas apresenta volume de atendimentos, taxa de resolução automática e tempo médio de resposta. Analise esses números semanalmente para identificar gargalos.",
          "Recomenda-se combinar relatórios quantitativos com feedback qualitativo de clientes para calibrar a comunicação dos agentes.",
        ],
        resources: [
          { label: "Modelo de relatório semanal", href: "https://example.com/relatorio-semanal" },
        ],
      },
    ],
  },
];

export default function DocumentationPage() {
  const defaultTopic = documentation[0]?.topics[0];
  const [activeTopicId, setActiveTopicId] = useState<string | undefined>(defaultTopic?.id);

  const activeTopic = useMemo(() => {
    return (
      documentation
        .flatMap((section) => section.topics)
        .find((topic) => topic.id === activeTopicId) ?? defaultTopic
    );
  }, [activeTopicId, defaultTopic]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-lg border bg-white">
        <div className="border-b px-5 py-4">
          <h1 className="text-lg font-semibold text-gray-900">Documentação</h1>
          <p className="text-sm text-gray-500">
            Explore guias em vídeo e texto para tirar o máximo proveito dos seus agentes.
          </p>
        </div>
        <nav className="max-h-[calc(100vh-12rem)] overflow-y-auto py-2">
          {documentation.map((section) => (
            <div key={section.id} className="px-2">
              <p className="px-3 pb-2 pt-4 text-xs font-semibold uppercase text-gray-400">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.topics.map((topic) => {
                  const isActive = topic.id === activeTopic?.id;
                  return (
                    <li key={topic.id}>
                      <button
                        type="button"
                        onClick={() => setActiveTopicId(topic.id)}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          isActive
                            ? "bg-[#2F6F68] text-white shadow"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span className="block font-medium">{topic.title}</span>
                        <span
                          className={`mt-0.5 block text-xs ${
                            isActive ? "text-white/80" : "text-gray-500"
                          }`}
                        >
                          {topic.summary}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <section className="space-y-6">
        <Card className="border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              {activeTopic?.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {activeTopic?.summary}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeTopic?.videoUrl && (
              <div className="overflow-hidden rounded-lg border">
                <div className="aspect-video w-full bg-black/5">
                  <iframe
                    src={activeTopic.videoUrl}
                    title={activeTopic.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
            )}
            {activeTopic?.content.map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-gray-700">
                {paragraph}
              </p>
            ))}
            {activeTopic?.resources && activeTopic.resources.length > 0 && (
              <div className="border-t pt-4">
                <h2 className="text-sm font-semibold text-gray-900">
                  Materiais complementares
                </h2>
                <ul className="mt-2 space-y-2">
                  {activeTopic.resources.map((resource) => (
                    <li key={resource.href}>
                      <a
                        href={resource.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#2F6F68] hover:underline"
                      >
                        {resource.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
