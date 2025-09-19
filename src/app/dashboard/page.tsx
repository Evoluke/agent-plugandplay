// src/app/dashboard/page.tsx

'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Folder, Users, FileText, Bot, Database, MessageCircle, CreditCard, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabasebrowser } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type User = {
  id: string;
};

type Company = {
  id: string;
  user_id: string;
  company_name: string;
  profile_complete: boolean;
  company_profile_id?: number;
};

type Message = {
  message_date: string;
  message_count: number;
};

type OnboardingStep = {
  title: string;
  description: string;
  highlights: string[];
  icon: LucideIcon;
};

const ONBOARDING_STORAGE_PREFIX = "dashboard-onboarding-";

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Crie e edite seu agente de IA",
    description: "Monte a personalidade, o comportamento e os fluxos do seu agente em poucos minutos.",
    highlights: [
      "Comece com um template ou personalize o tom de voz do zero.",
      "Teste respostas em tempo real antes de publicar seu agente.",
    ],
    icon: Bot,
  },
  {
    title: "Conecte-se ao seu CRM",
    description: "Traga leads e oportunidades para dentro da plataforma com sincronização automática.",
    highlights: [
      "Mantenha contatos e históricos sempre atualizados em um só lugar.",
      "Acompanhe conversas e estágios de cada oportunidade com clareza.",
    ],
    icon: Database,
  },
  {
    title: "Integre com o WhatsApp",
    description: "Ative a comunicação nos canais em que seus clientes já estão presentes.",
    highlights: [
      "Centralize as mensagens recebidas e distribua para seus agentes.",
      "Monitore métricas de engajamento para otimizar o atendimento.",
    ],
    icon: MessageCircle,
  },
  {
    title: "Finalize o pagamento",
    description: "Escolha o plano ideal e acompanhe cobranças, notas fiscais e histórico financeiro.",
    highlights: [
      "Visualize valores, datas de vencimento e status em tempo real.",
      "Centralize formas de pagamento e documentos em um painel só.",
    ],
    icon: CreditCard,
  },
  {
    title: "Ative seu agente",
    description: "Com tudo configurado, coloque o agente para trabalhar com segurança.",
    highlights: [
      "Defina horários de atendimento e regras de encaminhamento.",
      "Acompanhe desempenho e ajuste estratégias continuamente.",
    ],
    icon: Rocket,
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [dailyMessages, setDailyMessages] = useState<{ date: string; count: number }[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    supabasebrowser.auth.getUser().then(({ data, error }) => {
      if (error || !data?.user) {
        toast.error("Erro ao buscar usuário.");
      } else {

        setUser(data.user);
      }
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    supabasebrowser
      .from('company')
      .select('*')
      .eq('user_id', user.id)
      .single()          // pega apenas um registro
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar company:', error.message);
          toast.error('Erro ao buscar company.');
        } else {
          setCompany(data);
        }
      });
  }, [user]);

  useEffect(() => {
    if (!company?.id) return;
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    supabasebrowser
      .from("messages")
      .select("message_date, message_count")
      .eq("company_id", company.id)
      .gte("message_date", last30Days.toISOString().split("T")[0]) // 👈 só últimos 30 dias
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao buscar mensagens:", error.message);
          return;
        }
        if (!data) return;
        const formatted = (data as Message[])
          .map((msg) => ({ date: msg.message_date, count: msg.message_count }))
          .sort((a, b) => a.date.localeCompare(b.date));
        setDailyMessages(formatted);
      });
  }, [company]);

  useEffect(() => {
    if (!user?.id) return;

    const key = `${ONBOARDING_STORAGE_PREFIX}${user.id}`;
    if (typeof window === "undefined") return;

    const hasSeen = window.localStorage.getItem(key);
    if (!hasSeen) {
      setOnboardingStep(0);
      setShowOnboarding(true);
    }
  }, [user]);

  if (!user || !company) return null;

  const totalSteps = onboardingSteps.length;
  const currentStep = onboardingSteps[Math.min(onboardingStep, totalSteps - 1)];
  const StepIcon = currentStep.icon;
  const progressValue = ((onboardingStep + 1) / totalSteps) * 100;

  const handleDismissOnboarding = () => {
    if (!user?.id || typeof window === "undefined") return;
    window.localStorage.setItem(`${ONBOARDING_STORAGE_PREFIX}${user.id}`, "true");
    setShowOnboarding(false);
  };

  const handleNextStep = () => {
    if (onboardingStep < totalSteps - 1) {
      setOnboardingStep((prev) => prev + 1);
      return;
    }
    handleDismissOnboarding();
  };

  const handleSkip = () => {
    handleDismissOnboarding();
    setOnboardingStep(0);
  };

  const isLastStep = onboardingStep === totalSteps - 1;



  const actionItems = [
    { icon: <Folder className="w-5 h-5 text-[#2F6F68]" />, title: "Criar Agentes", desc: "Criar novo agente de IA", href: "/dashboard/agents/new", disabled: false },
    { icon: <Users className="w-5 h-5 text-[#97B7B4]" />, title: "Monitoramento", desc: "Monitore seus agentes de IA", href: "/dashboard/", disabled: true },
    { icon: <FileText className="w-5 h-5 text-[#2F6F68]" />, title: "Gerar Relatórios", href: "/dashboard/", desc: "Compartilhe insights com as partes interessadas", disabled: true },
  ];

  return (
    <div className="p-4 space-y-6">
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={handleSkip}
              className="absolute right-4 top-4 text-xs font-medium uppercase tracking-wide text-gray-400 hover:text-gray-600"
            >
              Pular
            </button>

            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F6F68]/10 text-[#2F6F68]">
                <StepIcon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#2F6F68]">
                  Passo {onboardingStep + 1} de {totalSteps}
                </p>
                <h2 className="text-lg font-semibold text-gray-900">{currentStep.title}</h2>
              </div>
            </div>

            <p className="mb-4 text-sm text-gray-600">{currentStep.description}</p>

            {currentStep.highlights.length > 0 && (
              <ul className="mb-6 space-y-2">
                {currentStep.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-[#2F6F68]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            <Progress value={progressValue} />

            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" onClick={handleSkip} className="text-sm text-gray-500 hover:text-gray-700">
                Pular introdução
              </Button>
              <Button onClick={handleNextStep} className="bg-[#2F6F68] hover:bg-[#24524d]">
                {isLastStep ? "Começar agora" : "Próximo"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel de Controle</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Olá, {company.company_name} 👋</h2>
          <p className="text-base text-gray-700">Quais são seus objetivos para hoje?</p>
          <p className="text-sm text-gray-500">
            Esta plataforma permite orquestrar, monitorar e otimizar agentes de IA de forma colaborativa. Teste, analise e aprimore decisões com base em dados reais — em equipe, em escala e com total controle.
          </p>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actionItems.map((item) => (
              <Link key={item.title} href={item.href}>
                <Card
                  key={item.title}
                  className={`relative h-36 transition ${item.disabled ? 'cursor-not-allowed' : 'hover:shadow-lg'}`}
                >
                  {item.disabled && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-[#2F6F68] text-white text-xs font-semibold px-2 py-1 rounded">
                        Em breve
                      </span>
                    </div>
                  )}

                  <div className={`${item.disabled ? 'opacity-50 select-none' : ''}`}>

                    <CardHeader className="flex items-center gap-2 px-3 pt-3">
                      {item.icon}
                      <CardTitle className="text-base font-medium">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <CardDescription className="text-xs text-gray-600">
                        {item.desc}
                      </CardDescription>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Mensagens por dia</h3>
        <div className="h-64 sm:h-80 w-full overflow-x-auto">
          {dailyMessages.length ? (
            <div className="min-w-[600px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyMessages}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value as string).toLocaleDateString('pt-BR')
                    }
                    formatter={(value: number) => [`${value} mensagens`, '']}
                    contentStyle={{ borderRadius: '0.375rem', borderColor: '#e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorCount)"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full text-sm text-gray-500">
              Nenhuma mensagem registrada
            </div>
          )}
        </div>
      </div>

      {/*
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Estatísticas</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
            Mensal
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { icon: <Folder className="w-5 h-5 text-green-400" />, title: "Novas Conversas", value: "12", note: "+2 essa semana" },
            { icon: <Users className="w-5 h-5 text-blue-400" />, title: "Mensagens Recebidas", value: "248", note: "+30 essa semana" },
            { icon: <Clock className="w-5 h-5 text-indigo-400" />, title: "Tempo Médio de Resposta", value: "6m", note: "↑ 2% vs última semana" },
            { icon: <Users className="w-5 h-5 text-teal-400" />, title: "Usuários Ativos", value: "8" },
            { icon: <FileText className="w-5 h-5 text-red-400" />, title: "Transferência Atendente", value: "22", note: "+6 esta semana" },
          ].map((stat) => (
            <Card key={stat.title} className="h-32">
              <CardContent className="flex flex-col justify-between h-full px-3 py-2">
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <CardTitle className="text-sm font-semibold">{stat.title}</CardTitle>
                </div>
                <div className="text-xl font-bold">{stat.value}</div>
                <CardDescription className="text-xs text-gray-500">{stat.note}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      */}
    </div>
  );
}
