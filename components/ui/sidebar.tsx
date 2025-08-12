// src/components/Sidebar.tsx

'use client';

import { supabasebrowser } from '@/lib/supabaseClient';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  Home,
  Settings,
  CreditCard,
  HelpCircle,
  Brain,
  LogOut,
} from 'lucide-react';
import { MAX_AGENTS_PER_COMPANY } from '@/lib/constants';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainItem: NavItem = {
  label: 'Início',
  href: '/dashboard',
  icon: <Home size={20} />,
};

const navItems: NavItem[] = [
  { label: 'Pagamentos', href: '/dashboard/payments', icon: <CreditCard size={20} /> },
  { label: 'Configuração', href: '/dashboard/config', icon: <Settings size={20} /> },
  { label: 'Suporte', href: '/dashboard/support', icon: <HelpCircle size={20} /> },
];

type Agent = {
  id: string;
  name: string;
};

export function Sidebar() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchAgents = async () => {
    const { data } = await supabasebrowser.auth.getUser();
    const user = data?.user;
    if (!user) return;
    const { data: company } = await supabasebrowser
      .from('company')
      .select('id')
      .eq('user_id', user.id)
      .single();
    if (!company?.id) return;
    const { data: agentData } = await supabasebrowser
      .from('agents')
      .select('id,name')
      .eq('company_id', company.id);
    setAgents(agentData || []);
  };

  useEffect(() => {
    fetchAgents();
    window.addEventListener('agentsUpdated', fetchAgents);
    return () => window.removeEventListener('agentsUpdated', fetchAgents);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabasebrowser.auth.signOut();

    if (error) {
      console.error('Erro ao fazer logout:', error.message);
      return;
    }
    router.replace('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="w-16 bg-white border-r h-full flex flex-col items-center py-4 space-y-4">
      <div className="w-10 h-10 bg-[#0D0D0D] rounded-xl flex items-center justify-center p-1">
              <img
        src="/logo-sidebar.svg"
        alt="Logomarca Evoluke"
        className="w-8 h-8"
      />

      </div>

      <nav className="flex flex-col space-y-2">
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Link
              href={mainItem.href}
              className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
            >
              {mainItem.icon}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" sideOffset={6} className="pointer-events-none">
            <span>{mainItem.label}</span>
          </TooltipContent>
        </Tooltip>

        <div ref={menuRef} className="relative">
          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <button
                onClick={() => setOpen((o) => !o)}
                className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
              >
                <Brain size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" sideOffset={6} className="pointer-events-none">
              <span>Agentes IA</span>
            </TooltipContent>
          </Tooltip>
          {open && (
            <div className="absolute left-12 top-0 z-10 w-64 bg-white border rounded shadow-md">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/dashboard/agents/${agent.id}`}
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  🤖 {agent.name}
                </Link>
              ))}
              {agents != null && (
                <div className="border-t my-1" />
              )}

              {agents.length < MAX_AGENTS_PER_COMPANY ? (
                <Link
                  href="/dashboard/agents/new"
                  className="block py-2 text-sm font-semibold text-center justify-center text-[#0E4DE0] hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Criar novo Agente IA
                </Link>
              ) : (
                <span className="block px-4 py-2 text-sm text-gray-500 text-center">
                  Limite de agentes atingido
                </span>
              )}
            </div>
          )}
        </div>

        {navItems.map((item) => (
          <Tooltip key={item.href} disableHoverableContent>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
              >
                {item.icon}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" sideOffset={6} className="pointer-events-none">
              <span>{item.label}</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>

      <div className="mt-auto">
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
            >
              <LogOut size={20} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" sideOffset={6} className="pointer-events-none">
            <span>Logout</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}