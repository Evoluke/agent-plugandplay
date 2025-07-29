// src/components/Sidebar.tsx

import React from 'react';
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

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Início', href: '/dashboard', icon: <Home size={20} /> },
  { label: 'Agentes IA', href: '/dashboard/agents', icon: <Brain size={20} /> },
  { label: 'Pagamentos', href: '/dashboard/payments', icon: <CreditCard size={20} /> },
  { label: 'Configuração', href: '/dashboard/config', icon: <Settings size={20} /> },
  { label: 'Suporte', href: '/dashboard/support', icon: <HelpCircle size={20} /> },
];

export function Sidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem("sb-access-token");
    localStorage.removeItem("sb-refresh-token");
    localStorage.removeItem("sb-expires-at");
    document.cookie =
      "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    if (res.ok) router.replace('/login');
  };

  return (
    <aside className="w-16 bg-white border-r h-full flex flex-col items-center py-4 space-y-4">
      <div className="w-10 h-10 bg-gray-100 rounded-xl border border-gray-300 flex items-center justify-center p-1">
        <span className="text-xl font-semibold text-gray-700">E</span>
      </div>

      <nav className="flex flex-col space-y-2">
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