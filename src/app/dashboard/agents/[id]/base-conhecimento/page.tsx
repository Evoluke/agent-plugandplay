"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import * as Dialog from "@radix-ui/react-dialog";
import { FileText, HelpCircle, File as FileIcon, Trash } from "lucide-react";
import { toast } from "sonner";
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<KnowledgeFile | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileTypesOpen, setFileTypesOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const mimeToExt: Record<string, string> = {
    "application/pdf": "PDF",
    "text/plain": "TXT",
  };
  const allowedFileTypes = ALLOWED_KNOWLEDGE_MIME_TYPES.map(
    (type) => mimeToExt[type] || type
  ).join(", ");

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
    // { label: "Websites", icon: Globe },
    { label: "Arquivos", icon: FileText },
    // { label: "FAQ", icon: HelpCircle },
    // { label: "Vídeos", icon: Video },
  ];

  const MAX_TOKENS = 10_000_000;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUploading(true);
    const file = e.target.files?.[0];
    if (!file || !agent) {
      setUploading(false);
      return;
    }
    if (!ALLOWED_KNOWLEDGE_MIME_TYPES.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado");
      e.target.value = "";
      setUploading(false);
      return;
    }
    if (file.size > MAX_KNOWLEDGE_FILE_SIZE) {
      toast.error("Arquivo excede o tamanho máximo de 10MB");
      e.target.value = "";
      setUploading(false);
      return;
    }
    const tokens = Math.ceil(file.size / 4);
    const totalTokens = files.reduce((sum, f) => sum + f.tokens, 0);
    if (totalTokens + tokens > MAX_TOKENS) {
      toast.error("Limite de tokens excedido");
      e.target.value = "";
      setUploading(false);
      return;
    }
    const t = toast.loading("Carregando arquivo...");
    const formData = new FormData();
    formData.append("file", file);
    const validation = await fetch("/api/knowledge-base/validate", {
      method: "POST",
      body: formData,
    });
    if (!validation.ok) {
      await validation
        .json()
        .catch(() => ({ error: "Arquivo inválido" }));
      toast.error("Falha no upload", { id: t });
      e.target.value = "";
      setUploading(false);
      return;
    }
    const extension = file.name.includes(".")
      ? file.name.substring(file.name.lastIndexOf("."))
      : "";
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const finalFileName = baseName.slice(0, 50) + extension;
    const uploadFile =
      finalFileName === file.name
        ? file
        : new File([file], finalFileName, { type: file.type });
    const fileId = crypto.randomUUID();
    const { data, error } = await supabasebrowser
      .from("agent_knowledge_files")
      .insert({
        id: fileId,
        agent_id: id,
        company_id: agent.company_id,
        name: finalFileName,
        tokens,
      })
      .select()
      .single();
    if (error || !data) {
      toast.error("Falha no upload", { id: t });
      e.target.value = "";
      setUploading(false);
      return;
    }
    try {
      const uploadData = new FormData();
      uploadData.append("file", uploadFile);
      const response = await fetch(
        `/api/knowledge-base/upload?path_id=${fileId}&company_id=${agent.company_id}&agent_id=${id}`,
        {
          method: "POST",
          body: uploadData,
        }
      );
      if (!response.ok) {
        await supabasebrowser.from("agent_knowledge_files").delete().eq("id", fileId);
        toast.error("Falha no upload", { id: t });
        e.target.value = "";
        setUploading(false);
        return;
      }
    } catch {
      await supabasebrowser.from("agent_knowledge_files").delete().eq("id", fileId);
      toast.error("Falha no upload", { id: t });
      e.target.value = "";
      setUploading(false);
      return;
    }
    setFiles((prev) => [...prev, data]);
    toast.success("Arquivo carregado!", { id: t });
    e.target.value = "";
    setUploading(false);
  };

  const handleRemove = async () => {
    if (!agent || !fileToDelete) return;
    setDeleteLoading(true);

    const { error } = await supabasebrowser
      .from("agent_knowledge_files")
      .delete()
      .eq("id", fileToDelete.id);
    if (error) {
      toast.error("Falha ao remover arquivo");
      setDeleteLoading(false);
      return;
    }

    // Remove the document embedding associated with this file
    const { error: docError } = await supabasebrowser
      .from("documents")
      .delete()
      .eq("metadata->>company_id", agent.company_id.toString())
      .eq("metadata->>agent_id", id)
      .eq("metadata->>path_id", fileToDelete.id);

    if (docError) {
      await supabasebrowser.from("agent_knowledge_files").insert({
        id: fileToDelete.id,
        agent_id: id,
        company_id: agent.company_id,
        name: fileToDelete.name,
        tokens: fileToDelete.tokens,
      });
      toast.error("Falha ao remover arquivo");
      setDeleteLoading(false);
      return;
    }

    setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
    toast.success("Arquivo removido");
    setDeleteLoading(false);
    setDeleteOpen(false);
    setFileToDelete(null);
    setConfirmName("");
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
        <Card className="w-full md:w-[90%] p-6">
          <p className="text-xs italic text-gray-500 mb-4">
            Adicione arquivos para compor a base de conhecimento do agente.
          </p>
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
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      Adicionar Fonte
                    </Button>
                    <Tooltip
                      open={fileTypesOpen}
                      onOpenChange={setFileTypesOpen}
                    >
                      <TooltipTrigger asChild>
                        <HelpCircle
                          className="h-4 w-4 cursor-pointer"
                          onClick={() => setFileTypesOpen(!fileTypesOpen)}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Tipos de arquivos suportados: {allowedFileTypes}
                      </TooltipContent>
                    </Tooltip>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    {uploading && (
                      <span></span>
                    )}
                  </div>
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
                              <FileIcon className="h-4 w-4" />
                              <span>{file.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span>{file.tokens.toLocaleString()} tokens</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setFileToDelete(file);
                                  setConfirmName("");
                                  setDeleteOpen(true);
                                }}
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
        <div className="w-full md:w-[90%] flex justify-end gap-2">
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
        </div>
      </div>
      <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow space-y-4">
            <Dialog.Title className="text-lg font-semibold">
              Excluir arquivo
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600">
              Digite o nome do arquivo &quot;
              <span className="font-semibold">{fileToDelete?.name}</span>
              &quot; para confirmar.
            </Dialog.Description>
            <Input
              placeholder="Nome do arquivo"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemove}
                disabled={confirmName !== fileToDelete?.name || deleteLoading}
              >
                {deleteLoading ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

