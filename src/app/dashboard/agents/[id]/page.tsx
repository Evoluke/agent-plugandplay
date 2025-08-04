"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";

type Agent = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
};

export default function AgentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (!id) return;
    supabasebrowser
      .from("agents")
      .select("id,name,type,is_active")
      .eq("id", id)
      .single()
      .then(({ data }) => setAgent(data));
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">{agent.name}</h1>
      <p className="text-sm text-gray-600">Função: {agent.type}</p>
      <p className="text-sm">Status: {agent.is_active ? "Ativo" : "Inativo"}</p>
    </div>
  );
}

