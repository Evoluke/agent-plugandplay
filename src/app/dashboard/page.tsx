// src/app/dashboard/page.tsx

'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Folder, Users, FileText } from "lucide-react";
import { supabasebrowser } from '@/lib/supabaseClient';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  selector: string;
  title: string;
  description: string;
};

type StepPosition = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

const DASHBOARD_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    selector: '[data-onboarding-target="create-agent"]',
    title: 'Comece pelos agentes',
    description:
      'Crie seu primeiro agente de IA para começar a operar na plataforma.',
  },
  {
    selector: '[data-onboarding-target="sidebar-crm"]',
    title: 'Acesse o CRM',
    description:
      'Use este atalho na barra lateral para abrir o CRM omnicanal.',
  },
  {
    selector: '[data-onboarding-target="sidebar-payments"]',
    title: 'Gerencie pagamentos',
    description:
      'Aqui você acompanha cobranças, notas fiscais e detalhes do seu plano.',
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [dailyMessages, setDailyMessages] = useState<{ date: string; count: number }[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [positions, setPositions] = useState<(StepPosition | null)[]>(() =>
    DASHBOARD_ONBOARDING_STEPS.map(() => null),
  );
  const currentStepData = DASHBOARD_ONBOARDING_STEPS[currentStep] ?? null;
  const currentPosition = positions[currentStep] ?? null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasSeenOnboarding = localStorage.getItem('dashboard_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_onboarding_seen', 'true');
    }
    setShowOnboarding(false);
    setCurrentStep(0);
  }, []);

  const handleNextStep = useCallback(() => {
    if (currentStep < DASHBOARD_ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    completeOnboarding();
  }, [completeOnboarding, currentStep]);

  const recalcPositions = useCallback(() => {
    if (typeof window === 'undefined') return;

    const updatedPositions = DASHBOARD_ONBOARDING_STEPS.map((step) => {
      const element = document.querySelector(step.selector) as HTMLElement | null;
      if (!element) return null;

      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      } satisfies StepPosition;
    });

    setPositions(updatedPositions);
  }, []);

  const popoverStyle = useMemo(() => {
    if (typeof window === 'undefined') {
      return { top: 0, left: 0, width: 320 };
    }

    const padding = 16;
    const defaultWidth = 320;
    const width = Math.min(defaultWidth, window.innerWidth - padding * 2);

    if (!currentPosition) {
      return {
        top: Math.max(padding, window.innerHeight / 2 - 100),
        left: Math.max(padding, window.innerWidth / 2 - width / 2),
        width,
      };
    }

    let left = currentPosition.left;
    if (left + width > window.innerWidth - padding) {
      left = window.innerWidth - width - padding;
    }
    if (left < padding) {
      left = padding;
    }

    const estimatedHeight = 200;
    const maxTop = Math.max(padding, window.innerHeight - estimatedHeight - padding);
    let top = currentPosition.bottom + 16;
    if (top > maxTop) {
      top = currentPosition.top - estimatedHeight - 16;
    }
    if (top < padding) {
      top = padding;
    }
    if (top > maxTop) {
      top = maxTop;
    }

    return { top, left, width };
  }, [currentPosition]);

  const highlightStyle = useMemo(() => {
    if (!currentPosition) {
      return { opacity: 0 };
    }

    const padding = 12;
    return {
      top: Math.max(currentPosition.top - padding, 8),
      left: Math.max(currentPosition.left - padding, 8),
      width: currentPosition.width + padding * 2,
      height: currentPosition.height + padding * 2,
      opacity: 1,
    };
  }, [currentPosition]);

  useEffect(() => {
    if (!showOnboarding || typeof window === 'undefined') return;

    const frame = requestAnimationFrame(() => recalcPositions());
    return () => cancelAnimationFrame(frame);
  }, [showOnboarding, currentStep, user?.id, company?.id, recalcPositions]);

  useEffect(() => {
    if (!showOnboarding || typeof window === 'undefined') return;

    const handleRecalc = () => {
      requestAnimationFrame(() => recalcPositions());
    };

    window.addEventListener('resize', handleRecalc);
    window.addEventListener('scroll', handleRecalc, true);

    return () => {
      window.removeEventListener('resize', handleRecalc);
      window.removeEventListener('scroll', handleRecalc, true);
    };
  }, [showOnboarding, recalcPositions]);

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

  if (!user || !company) return null;



  const actionItems = [
    { icon: <Folder className="w-5 h-5 text-[#2F6F68]" />, title: "Criar Agentes", desc: "Criar novo agente de IA", href: "/dashboard/agents/new", disabled: false },
    { icon: <Users className="w-5 h-5 text-[#97B7B4]" />, title: "Monitoramento", desc: "Monitore seus agentes de IA", href: "/dashboard/", disabled: true },
    { icon: <FileText className="w-5 h-5 text-[#2F6F68]" />, title: "Gerar Relatórios", href: "/dashboard/", desc: "Compartilhe insights com as partes interessadas", disabled: true },
  ];

  return (
    <div className="p-4 space-y-6">
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
              <Link
                key={item.title}
                href={item.href}
                data-onboarding-target={
                  item.title === "Criar Agentes" ? "create-agent" : undefined
                }
              >
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

      <div className="space-y-2" data-onboarding-target="messages-chart">
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

      {showOnboarding && currentStepData && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {currentPosition && (
            <div
              className="pointer-events-none fixed z-10 rounded-2xl border-2 border-emerald-400 bg-emerald-100/20 shadow-[0_20px_60px_rgba(15,23,42,0.35)] transition-all duration-200"
              style={highlightStyle}
            />
          )}

          <div className="fixed z-20" style={popoverStyle}>
            <div className="w-80 max-w-[calc(100vw-32px)] rounded-2xl border border-emerald-100 bg-white p-5 shadow-xl">
              <div>
                <p className="text-sm font-semibold text-emerald-700">{currentStepData.title}</p>
                <p className="mt-2 text-sm text-slate-600">{currentStepData.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Passo {currentStep + 1} de {DASHBOARD_ONBOARDING_STEPS.length}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    {DASHBOARD_ONBOARDING_STEPS.map((step, index) => (
                      <span
                        key={step.selector}
                        className={`h-1.5 w-6 rounded-full transition-colors duration-200 ${
                          index <= currentStep ? 'bg-emerald-500' : 'bg-emerald-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    {currentStep === DASHBOARD_ONBOARDING_STEPS.length - 1 ? 'Concluir' : 'Próximo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
