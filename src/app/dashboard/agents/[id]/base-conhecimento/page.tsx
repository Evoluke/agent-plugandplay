"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Smile,
  Settings,
  BookOpen,
  Database,
  ClipboardList,
  Globe,
  FileText,
  HelpCircle,
  Video,
  File,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import UpdateAgentButton from "@/components/agents/UpdateAgentButton";

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
  path: string;
}

export default function AgentKnowledgeBasePage() {
  const params = useParams();
  const id = params?.id as string;
  const pathname = usePathname();
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
        .select("id,name,tokens,path")
        .eq("agent_id", id);
      setFiles(fileData || []);
    };
    fetchData();
  }, [id]);

  if (!agent) return <div>Carregando...</div>;

  const menuItems = [
    { label: "Personalidade", icon: Smile, href: `/dashboard/agents/${id}` },
    {
      label: "Comportamento",
      icon: Settings,
      href: `/dashboard/agents/${id}/comportamento`,
    },
    { label: "Onboarding", icon: BookOpen, href: `/dashboard/agents/${id}/onboarding` },
    {
      label: "Base de conhecimento",
      icon: Database,
      href: `/dashboard/agents/${id}/base-conhecimento`,
    },
    {
      label: "Instruções Específicas",
      icon: ClipboardList,
      href: `/dashboard/agents/${id}/instrucoes-especificas`,
    },
  ];

  const sidebarItems = [
    { label: "Websites", icon: Globe },
    { label: "Arquivos", icon: FileText },
    { label: "FAQ", icon: HelpCircle },
    { label: "Vídeos", icon: Video },
  ];

  const MAX_TOKENS = 1_000_000;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !agent) return;
    const tokens = Math.ceil(file.size / 4);
    const totalTokens = files.reduce((sum, f) => sum + f.tokens, 0);
    if (totalTokens + tokens > MAX_TOKENS) {
      toast.error("Limite de tokens excedido");
      e.target.value = "";
      return;
    }
    const path = `${agent.company_id}/${id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabasebrowser.storage
      .from("knowledge-base")
      .upload(path, file);
    if (uploadError) {
      toast.error("Falha no upload do arquivo");
      e.target.value = "";
      return;
    }
    const { data, error } = await supabasebrowser
      .from("agent_knowledge_files")
      .insert({
        agent_id: id,
        company_id: agent.company_id,
        name: file.name,
        tokens,
        path,
      })
      .select()
      .single();
    if (error || !data) {
      toast.error("Falha ao salvar arquivo");
    } else {
      setFiles((prev) => [...prev, data]);
      toast.success("Arquivo adicionado");
    }
    e.target.value = "";
  };

  const handleRemove = async (file: KnowledgeFile) => {
    await supabasebrowser.storage.from("knowledge-base").remove([file.path]);
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
      <div className="flex justify-center">
        <Card className="w-4/5 p-6">
          <div className="space-y-4">
            <nav className="flex items-center justify-around">
              {menuItems.map(({ label, icon: Icon, href }, index) => (
                <Fragment key={label}>
                  <Button
                    asChild
                    variant={pathname === href ? "secondary" : "ghost"}
                    className="flex h-auto flex-col items-center gap-1 text-sm"
                  >
                    <Link href={href} className="flex flex-col items-center">
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  </Button>
                  {index < menuItems.length - 1 && (
                    <div className="h-8 border-l" />
                  )}
                </Fragment>
              ))}
            </nav>
            <div className="flex justify-end">
              <UpdateAgentButton agentId={id} />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-center">
        <Card className="w-4/5 p-6">
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold">Cérebro</h2>
            <div className="flex gap-6">
              <aside className="w-40 flex-shrink-0 space-y-2">
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
                <div className="flex items-center justify-between">
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
    </div>
  );
}

