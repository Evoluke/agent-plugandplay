"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Globe,
  FileText,
  HelpCircle,
  Video,
  File,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import UpdateAgentButton from "@/components/agents/UpdateAgentButton";
import {
  ALLOWED_KNOWLEDGE_MIME_TYPES,
  MAX_KNOWLEDGE_FILE_SIZE,
} from "@/lib/constants";
import AgentMenu from "@/components/agents/AgentMenu";
import AgentGuide from "@/components/agents/AgentGuide";
import DeactivateAgentButton from "@/components/agents/DeactivateAgentButton";
import ActivateAgentButton from "@/components/agents/ActivateAgentButton";

interface Agent {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  company_id: number;
}

interface KnowledgeFile {
  id: string;
  name: string;
  tokens: number;
}

export default function AgentKnowledgeBasePage() {
  const params = useParams();
  const id = params?.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeSection, setActiveSection] = useState("Arquivos");
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const { data: agentData } = await supabasebrowser
        .from("agents")
        .select("id,name,type,is_active,company_id")
        .eq("id", id)
        .single();
      setAgent(agentData);

      const { data: fileData } = await supabasebrowser
        .from("agent_knowledge_files")
        .select("id,name,tokens")
        .eq("agent_id", id);
      setFiles(fileData || []);
    };
    fetchData();
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  const sidebarItems = [
    { label: "Websites", icon: Globe },
    { label: "Arquivos", icon: FileText },
    { label: "FAQ", icon: HelpCircle },
    { label: "Vídeos", icon: Video },
  ];

  const MAX_TOKENS = 10_000_000;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !agent) return;
    if (!ALLOWED_KNOWLEDGE_MIME_TYPES.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_KNOWLEDGE_FILE_SIZE) {
      toast.error("Arquivo excede o tamanho máximo de 10MB");
      e.target.value = "";
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    const validation = await fetch("/api/knowledge-base/validate", {
      method: "POST",
      body: formData,
    });
    if (!validation.ok) {
      const { error } = await validation
        .json()
        .catch(() => ({ error: "Arquivo inválido" }));
      toast.error(error);
      e.target.value = "";
      return;
    }
    const tokens = Math.ceil(file.size / 4);
    const totalTokens = files.reduce((sum, f) => sum + f.tokens, 0);
    if (totalTokens + tokens > MAX_TOKENS) {
      toast.error("Limite de tokens excedido");
      e.target.value = "";
      return;
    }
    const fileId = crypto.randomUUID();
    const { data, error } = await supabasebrowser
      .from("agent_knowledge_files")
      .insert({
        id: fileId,
        agent_id: id,
        company_id: agent.company_id,
        name: file.name,
        tokens,
      })
      .select()
      .single();
    if (error || !data) {
      toast.error("Falha ao salvar arquivo");
      e.target.value = "";
      return;
    }
    try {
      const response = await fetch(
        `https://n8nwebhookplatform.tracelead.com.br/webhook/add-file-vector?id=${fileId}`,
        {
          method: "POST",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        }
      );
      if (!response.ok) {
        await supabasebrowser.from("agent_knowledge_files").delete().eq("id", fileId);
        toast.error("Falha ao processar arquivo");
        e.target.value = "";
        return;
      }
    } catch {
      await supabasebrowser.from("agent_knowledge_files").delete().eq("id", fileId);
      toast.error("Erro ao enviar arquivo");
      e.target.value = "";
      return;
    }
    setFiles((prev) => [...prev, data]);
    toast.success("Arquivo adicionado");
    e.target.value = "";
  };

  const handleRemove = async (file: KnowledgeFile) => {
    const { error } = await supabasebrowser
      .from("agent_knowledge_files")
      .delete()
      .eq("id", file.id);
    if (error) {
      toast.error("Falha ao remover arquivo");
      return;
    }
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    toast.success("Arquivo removido");
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalTokens = files.reduce((sum, f) => sum + f.tokens, 0);

  return (
    <div className="space-y-6">
      <AgentMenu agent={agent} />
      <AgentGuide />

      <div className="flex justify-center">
        <Card className="w-full md:w-4/5 p-6">
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold">Cérebro</h2>
            <div className="flex flex-col gap-6 md:flex-row">
              <aside className="w-full md:w-40 md:flex-shrink-0 space-y-2">
                {sidebarItems.map(({ label, icon: Icon }) => {
                  const active = activeSection === label;
                  return (
                    <Button
                      key={label}
                      variant={active ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2"
                      onClick={() => setActiveSection(label)}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  );
                })}
              </aside>
              <main className="flex-1 space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <Input
                    placeholder="Pesquisar"
                    className="max-w-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Adicionar Fonte
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </>
                </div>
                {activeSection === "Arquivos" ? (
                  <>
                    <h3 className="text-lg font-medium">Arquivos</h3>
                    <div className="overflow-x-auto">
                      <div className="rounded-md border divide-y">
                        {filteredFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between px-4 py-3"
                          >
                            <div className="flex items-center gap-2">
                              <File className="h-4 w-4" />
                              <span>{file.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span>{file.tokens.toLocaleString()} tokens</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(file)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {filteredFiles.length === 0 && (
                          <div className="p-4 text-sm text-muted-foreground">
                            Nenhum arquivo
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-right text-gray-500">
                      {totalTokens.toLocaleString()} / {MAX_TOKENS.toLocaleString()} tokens
                    </p>
                  </>
                ) : (
                  <h3 className="text-lg font-medium">
                    {activeSection} em desenvolvimento
                  </h3>
                )}
              </main>
            </div>
          </div>
        </Card>
      </div>
      <div className="flex justify-center">
        <div className="w-full md:w-4/5 flex justify-end gap-2">
          {agent.is_active ? (
            <DeactivateAgentButton
              agentId={id}
              onDeactivated={() =>
                setAgent((a) => (a ? { ...a, is_active: false } : a))
              }
            />
          ) : (
            <ActivateAgentButton
              agentId={id}
              onActivated={() =>
                setAgent((a) => (a ? { ...a, is_active: true } : a))
              }
            />
          )}
          <UpdateAgentButton agentId={id} />
        </div>
      </div>
    </div>
  );
}

