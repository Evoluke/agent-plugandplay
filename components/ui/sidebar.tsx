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
  Kanban,
  MoreHorizontal,
} from 'lucide-react';
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
  { label: 'Funil de vendas', href: '/dashboard/funil-de-vendas', icon: <Kanban size={20} /> },
  { label: 'Pagamentos', href: '/dashboard/payments', icon: <CreditCard size={20} /> },
  { label: 'Documentação', href: '/dashboard/documentacao', icon: <BookOpen size={20} /> },
];

const utilityNavItems: NavItem[] = [
  { label: 'Configuração', href: '/dashboard/config', icon: <Settings size={18} /> },
  { label: 'Suporte', href: '/dashboard/support', icon: <HelpCircle size={18} /> },
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
  const [agentsMenuOpen, setAgentsMenuOpen] = useState(false);
  const [utilitiesMenuOpen, setUtilitiesMenuOpen] = useState(false);
  const agentMenuRef = useRef<HTMLDivElement>(null);
  const utilitiesMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setUtilitiesMenuOpen(false);
    setAgentsMenuOpen(false);
    const { error } = await supabasebrowser.auth.signOut();

    if (error) {
      console.error('Erro ao fazer logout:', error.message);
      return;
    }
    router.replace('/login');
  };

  const handleChatwoot = () => {
    router.push('/dashboard/crm');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentMenuRef.current && !agentMenuRef.current.contains(event.target as Node)) {
        setAgentsMenuOpen(false);
      }
      if (
        utilitiesMenuRef.current &&
        !utilitiesMenuRef.current.contains(event.target as Node)
      ) {
        setUtilitiesMenuOpen(false);
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

        <div ref={agentMenuRef} className="relative">
          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  setUtilitiesMenuOpen(false);
                  setAgentsMenuOpen((o) => !o);
                }}
                className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
              >
                <Brain size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" sideOffset={6} className="pointer-events-none">
              <span>Agentes IA</span>
            </TooltipContent>
          </Tooltip>
          {agentsMenuOpen && (
            <div className="absolute left-12 top-0 z-10 w-64 bg-white border rounded shadow-md">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/dashboard/agents/${agent.id}`}
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setAgentsMenuOpen(false)}
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
                  onClick={() => setAgentsMenuOpen(false)}
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

      <div ref={utilitiesMenuRef} className="mt-auto relative">
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setAgentsMenuOpen(false);
                setUtilitiesMenuOpen((o) => !o);
              }}
              className="p-2 rounded hover:bg-gray-100 flex items-center justify-center"
            >
              <MoreHorizontal size={20} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" sideOffset={6} className="pointer-events-none">
            <span>Mais opções</span>
          </TooltipContent>
        </Tooltip>
        {utilitiesMenuOpen && (
          <div className="absolute left-12 bottom-0 z-10 w-56 rounded border bg-white shadow-md">
            {utilityNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setUtilitiesMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="border-t my-1" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const router = useRouter();
  const agents = useAgents();
  const chatwootId = useChatwootId();
  const [open, setOpen] = useState(false);
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabasebrowser.auth.signOut();

    if (error) {
      console.error('Erro ao fazer logout:', error.message);
      return;
    }
    setUtilitiesOpen(false);
    setOpen(false);
    router.replace('/login');
  };

  const handleChatwoot = () => {
    setOpen(false);
    router.push('/dashboard/crm');
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          setUtilitiesOpen(false);
        }
      }}
    >
      <Dialog.Trigger asChild>
        <button className="mb-4 inline-flex items-center justify-center rounded-md border p-2 sm:hidden">
          <Menu size={24} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 sm:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white p-4 shadow sm:hidden">
          <nav className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-2">
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
            </div>

            <div className="mt-auto border-t pt-2">
              <button
                onClick={() => setUtilitiesOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-2 rounded px-2 py-2 hover:bg-gray-100"
              >
                <span className="flex items-center gap-2">
                  <Settings size={20} />
                  <span>Mais opções</span>
                </span>
                <span className="text-sm text-gray-500">{utilitiesOpen ? '−' : '+'}</span>
              </button>
              {utilitiesOpen && (
                <div className="mt-2 space-y-1">
                  {utilityNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded px-2 py-2 text-sm hover:bg-gray-100"
                      onClick={() => {
                        setUtilitiesOpen(false);
                        setOpen(false);
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}