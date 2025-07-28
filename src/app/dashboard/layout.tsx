// src/app/dashboard/layout.tsx
"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      router.replace("/login");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r h-full">
        <div className="p-6 text-xl font-bold">Evoluke</div>
        <nav className="flex flex-col space-y-2 px-4">
          <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-gray-100">
            Início
          </Link>
          <Link href="/dashboard/menus" className="px-3 py-2 rounded hover:bg-gray-100">
            Menus
          </Link>
          <Link href="/dashboard/config" className="px-3 py-2 rounded hover:bg-gray-100">
            Configuração
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="mt-4">
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-50 p-6 h-full overflow-auto">
        {children}
      </main>
    </div>
  );
}