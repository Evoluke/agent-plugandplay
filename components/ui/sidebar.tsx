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
import * as Dialog from '@radix-ui/react-dialog';
import {
  Home,
  Settings,
  CreditCard,
  HelpCircle,
  Brain,
  LogOut,
  Menu,
  MessageSquare,
  BookOpen,
  KanbanSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { MAX_AGENTS_PER_COMPANY } from '@/lib/constants';
import { cn } from './utils';
import type { Session } from '@supabase/supabase-js';

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
  { label: 'Funil de vendas', href: '/dashboard/funil-de-vendas', icon: <KanbanSquare size={20} /> },
  { label: 'Pagamentos', href: '/dashboard/payments', icon: <CreditCard size={20} /> },
  { label: 'Configuração', href: '/dashboard/config', icon: <Settings size={20} /> },
  { label: 'Documentação', href: '/dashboard/documentacao', icon: <BookOpen size={20} /> },
  { label: 'Suporte', href: '/dashboard/support', icon: <HelpCircle size={20} /> },
];

type Agent = {
  id: string;
  name: string;
};

function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    let isMounted = true;
    let currentUserId: string | null = null;
    let authSubscription:
      | ReturnType<typeof supabasebrowser.auth.onAuthStateChange>['data']['subscription']
      | null = null;

    const fetchAgentsForUser = async (userId: string) => {
      const { data: company } = await supabasebrowser
        .from('company')
        .select('id')
        .eq('user_id', userId)
        .single();
      if (!company?.id || !isMounted) return;

      const { data: agentData } = await supabasebrowser
        .from('agents')
        .select('id,name')
        .eq('company_id', company.id);
      if (!isMounted) return;
      setAgents(agentData || []);
    };

    const handleSession = async (session: Session | null) => {
      const userId = session?.user?.id ?? null;
      if (!userId) {
        currentUserId = null;
        if (isMounted) setAgents([]);
        return;
      }

      currentUserId = userId;
      await fetchAgentsForUser(userId);
    };

    const handleAgentsUpdated = () => {
      if (currentUserId) {
        void fetchAgentsForUser(currentUserId);
      }
    };

    window.addEventListener('agentsUpdated', handleAgentsUpdated);

    supabasebrowser.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      void handleSession(session);
    });

    const { data } = supabasebrowser.auth.onAuthStateChange((_, session) => {
      void handleSession(session);
    });
    authSubscription = data.subscription;

    return () => {
      isMounted = false;
      window.removeEventListener('agentsUpdated', handleAgentsUpdated);
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  return agents;
}

function useChatwootId() {
  const [chatwootId, setChatwootId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let authSubscription:
      | ReturnType<typeof supabasebrowser.auth.onAuthStateChange>['data']['subscription']
      | null = null;

    const fetchChatwootId = async (userId: string) => {
      const { data: company } = await supabasebrowser
        .from('company')
        .select('chatwoot_id')
        .eq('user_id', userId)
        .single();

      if (!isMounted) return;
      setChatwootId(company?.chatwoot_id ?? null);
    };

    const handleSession = async (session: Session | null) => {
      const userId = session?.user?.id ?? null;
      if (!userId) {
        if (isMounted) setChatwootId(null);
        return;
      }

      await fetchChatwootId(userId);
    };

    supabasebrowser.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      void handleSession(session);
    });

    const { data } = supabasebrowser.auth.onAuthStateChange((_, session) => {
      void handleSession(session);
    });
    authSubscription = data.subscription;

    return () => {
      isMounted = false;
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  return chatwootId;
}

export function Sidebar({ className }: { className?: string }) {
  const router = useRouter();
  const agents = useAgents();
  const chatwootId = useChatwootId();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    const { error } = await supabasebrowser.auth.signOut();

    if (error) {
      console.error('Erro ao fazer logout:', error.message);
      return;
    }
    router.replace('/login');
  };

  const handleChatwoot = async () => {
    try {
      const res = await fetch('/api/chatwoot/sso');
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        console.error('[Chatwoot SSO] Endpoint error', res.status, data);
        throw new Error();
      }
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('[Chatwoot SSO] Failed to open CRM', err);
      toast('SSO indisponível, tente novamente mais tarde');
    }
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
    <aside
      className={cn(
        'w-16 bg-white border-r min-h-[100svh] flex flex-col items-center py-4 space-y-4 flex-shrink-0',
        'sm:fixed sm:inset-y-0 sm:left-0 sm:top-0 sm:h-[100svh] sm:z-20',
        className,
      )}
    >
      <div>
              <img
        src="/logo-sidebar.png"
        alt="Logomarca Evoluke"
        className="w-10 h-11"
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

        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            {chatwootId ? (
              <button
                onClick={handleChatwoot}
                className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
                type="button"
              >
                <MessageSquare size={20} />
              </button>
            ) : (
              <span className="p-2 rounded text-gray-400 flex items-center justify-center cursor-not-allowed">
                <MessageSquare size={20} />
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="end"
            sideOffset={6}
            className="pointer-events-none"
          >
            {chatwootId ? (
              <span>CRM</span>
            ) : (
              <span>Ocorreu algum erro, logo mais será normalizado.</span>
            )}
          </TooltipContent>
        </Tooltip>

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

export function MobileSidebar() {
  const router = useRouter();
  const agents = useAgents();
  const chatwootId = useChatwootId();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabasebrowser.auth.signOut();

    if (error) {
      console.error('Erro ao fazer logout:', error.message);
      return;
    }
    setOpen(false);
    router.replace('/login');
  };

  const handleChatwoot = async () => {
    try {
      const res = await fetch('/api/chatwoot/sso');
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.url) {
        console.error('[Chatwoot SSO] Endpoint error', res.status, data);
        throw new Error();
      }
      setOpen(false);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('[Chatwoot SSO] Failed to open CRM', err);
      toast('SSO indisponível, tente novamente mais tarde');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="mb-4 inline-flex items-center justify-center rounded-md border p-2 sm:hidden">
          <Menu size={24} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 sm:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-64 bg-white p-4 shadow sm:hidden flex flex-col">
          <nav className="flex-1 space-y-2">
            <Link
              href={mainItem.href}
              className="flex items-center gap-2 rounded px-2 py-2 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              {mainItem.icon}
              <span>{mainItem.label}</span>
            </Link>

            <div>
              <span className="block px-2 pt-2 text-xs font-semibold text-gray-500">
                Agentes IA
              </span>
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
              {agents.length < MAX_AGENTS_PER_COMPANY ? (
                <Link
                  href="/dashboard/agents/new"
                  className="block px-4 py-2 text-sm font-semibold text-[#0E4DE0] hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Criar novo Agente IA
                </Link>
              ) : (
                <span className="block px-4 py-2 text-sm text-gray-500">
                  Limite de agentes atingido
                </span>
              )}
            </div>

            {chatwootId ? (
              <button
                onClick={handleChatwoot}
                className="flex items-center gap-2 rounded px-2 py-2 hover:bg-gray-100"
                type="button"
              >
                <MessageSquare size={20} />
                <span>CRM</span>
              </button>
            ) : (
              <div
                className="flex items-center gap-2 rounded px-2 py-2 text-gray-400"
                title="Ocorreu algum erro, logo mais será normalizado."
              >
                <MessageSquare size={20} />
                <span>CRM</span>
              </div>
            )}

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded px-2 py-2 hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 rounded px-2 py-2 hover:bg-gray-100"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}