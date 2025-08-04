// src/components/Sidebar.tsx

"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Settings,
  CreditCard,
  HelpCircle,
  Brain,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { supabasebrowser } from "@/lib/supabaseClient";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface Agent {
  id: string;
  name: string;
}

const navItems: NavItem[] = [
  { label: "Início", href: "/dashboard", icon: <Home size={20} /> },
  { label: "Pagamentos", href: "/dashboard/payments", icon: <CreditCard size={20} /> },
  { label: "Configuração", href: "/dashboard/config", icon: <Settings size={20} /> },
  { label: "Suporte", href: "/dashboard/support", icon: <HelpCircle size={20} /> },
];

export function Sidebar() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    supabasebrowser.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      supabasebrowser
        .from("company")
        .select("id")
        .eq("user_id", user.id)
        .single()
        .then(({ data: company }) => {
          if (!company) return;
          supabasebrowser
            .from("agents")
            .select("id, name")
            .eq("company_id", company.id)
            .order("created_at", { ascending: true })
            .then(({ data }) => {
              if (data) setAgents(data);
            });
        });
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabasebrowser.auth.signOut();

    if (error) {
      console.error("Erro ao fazer logout:", error.message);
      return;
    }
    router.replace("/login");
  };

  return (
    <aside className="w-64 bg-white border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <span className="text-xl font-semibold text-gray-700">E</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        <div className="pt-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-gray-100"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            <Brain size={20} />
            <span>Agentes</span>
          </button>
          {!collapsed && (
            <div className="ml-8 mt-1 space-y-1">
              {agents.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/agents/${a.id}`}
                  className="block px-2 py-1 rounded hover:bg-gray-100"
                >
                  {a.name}
                </Link>
              ))}
              <hr className="my-2" />
              <Link
                href="/dashboard/agents/new"
                className="block px-2 py-1 rounded hover:bg-gray-100 text-blue-600"
              >
                + Novo Agente
              </Link>
            </div>
          )}
        </div>
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-1 rounded hover:bg-gray-100"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}