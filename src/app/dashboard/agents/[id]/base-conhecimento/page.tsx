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
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

export default function AgentKnowledgeBasePage() {
  const params = useParams();
  const id = params?.id as string;
  const pathname = usePathname();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeSection, setActiveSection] = useState("Arquivos");
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState([
    { name: "documento1.pdf", tokens: 2048 },
    { name: "documento2.pdf", tokens: 1024 },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    supabasebrowser
      .from("agents")
      .select("id,name,type,is_active")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setAgent(data);
      });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const tokens = Math.ceil(file.size / 4);
    setFiles((prev) => [...prev, { name: file.name, tokens }]);
    e.target.value = "";
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Card className="w-4/5 p-6">
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
                {index < menuItems.length - 1 && <div className="h-8 border-l" />}
              </Fragment>
            ))}
          </nav>
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
                          key={file.name}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4" />
                            <span>{file.name}</span>
                          </div>
                          <span>{file.tokens.toLocaleString()} tokens</span>
                        </div>
                      ))}
                    </div>
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

