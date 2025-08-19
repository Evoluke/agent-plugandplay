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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [dailyMessages, setDailyMessages] = useState<{ date: string; count: number }[]>([]);

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
    supabasebrowser
      .from('messages')
      .select('message_date, message_count')
      .eq('company_id', company.id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar mensagens:', error.message);
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
    { icon: <Folder className="w-5 h-5 text-blue-500" />, title: "Criar Agentes", desc: "Criar novo agente de IA", href: "/dashboard/agents/new", disabled: false },
    { icon: <Users className="w-5 h-5 text-green-500" />, title: "Monitoramento", desc: "Monitore seus agentes de IA", href: "/dashboard/", disabled: true },
    { icon: <FileText className="w-5 h-5 text-purple-500" />, title: "Gerar Relatórios", href: "/dashboard/", desc: "Compartilhe insights com as partes interessadas", disabled: true },
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
              <Link key={item.title} href={item.href}>
                <Card
                  key={item.title}
                  className={`relative h-36 transition ${item.disabled ? 'cursor-not-allowed' : 'hover:shadow-lg'}`}
                >
                  {item.disabled && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
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
        <div className="h-80">
          {dailyMessages.length ? (
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
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })
                  }
                />
                <YAxis allowDecimals={false} />
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
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-500">
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
