"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Agent = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
};

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabasebrowser.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchAgents = async () => {
      const { data } = await supabasebrowser
        .from("agents")
        .select("id,name,type,is_active,company!inner(user_id)")
        .eq("company.user_id", userId);
      setAgents(data || []);
    };
    fetchAgents();
  }, [userId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agentes IA</h1>
        <Button onClick={() => router.push("/dashboard/agents/new")}>
          Criar Agente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Função</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-2">
                    <Link href={`/dashboard/agents/${agent.id}`} className="hover:underline">
                      {agent.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 capitalize">{agent.type}</td>
                  <td className="px-4 py-2">
                    {agent.is_active ? "Ativo" : "Inativo"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

