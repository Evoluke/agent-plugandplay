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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

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

  if (!user || !company) return null;



  const actionItems = [
    { icon: <Folder className="w-5 h-5 text-blue-500" />, title: "Criar Agentes", desc: "Criar novo agente de IA", href: "/dashboard/agents/new", disabled: false },
    { icon: <Users className="w-5 h-5 text-green-500" />, title: "Monitoramento", desc: "Monitore seus agentes de IA", href: "/dashboard/", disabled: true },
    { icon: <FileText className="w-5 h-5 text-purple-500" />, title: "Gerar Relatórios", href: "/dashboard/", desc: "Compartilhe insights com as partes interessadas", disabled: true },
  ];

  const agentsData = [
    { key: 'agent1', color: 'bg-blue-500', label: 'Agente 1' },
    { key: 'agent2', color: 'bg-green-500', label: 'Agente 2' },
  ];

  const messageData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    agent1: ((i + 1) * 2) % 15 + 5,
    agent2: ((i + 1) * 3) % 20 + 2,
  }));

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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Mensagens por Agente</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
            Mensal
          </span>
        </div>
        <div className="w-full h-64 border rounded p-2">
          <div className="flex h-full items-end space-x-1">
            {messageData.map((d) => (
              <div key={d.day} className="flex-1 flex items-end space-x-1">
                {agentsData.map((agent) => (
                  <div
                    key={agent.key}
                    className={`${agent.color} w-2`}
                    style={{ height: `${d[agent.key as keyof typeof d] * 4}px` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex space-x-4 text-xs">
          {agentsData.map((agent) => (
            <div key={agent.key} className="flex items-center">
              <span className={`w-3 h-3 ${agent.color} mr-1`}></span>
              {agent.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
