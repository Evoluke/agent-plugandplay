// app/support/new/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabasebrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { CardTitle } from "@/components/ui/card";
import type { User } from "@supabase/supabase-js";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Company {
    id: string;
}

const motivos = [
    { value: "bug", label: "Erro no sistema" },
    { value: "suporte", label: "Dúvida / Suporte" },
    { value: "feature", label: "Sugestão de melhoria" },
    { value: "other", label: "Outros" },
]

export default function NewSupportPage() {
    const [titulo, setTitulo] = useState("")
    const [motivo, setMotivo] = useState<string | undefined>(undefined)
    const [descricao, setDescricao] = useState("")
    const [arquivo, setArquivo] = useState<File | null>(null)
    const [fileError, setFileError] = useState("")
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const [company, setCompany] = useState<Company | null>(null);

    useEffect(() => {
        const getInitialSession = async () => {
            const {
                data: { session },
            } = await supabasebrowser.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (!currentUser) router.replace("/login");
        };

        getInitialSession();

        const {
            data: { subscription },
        } = supabasebrowser.auth.onAuthStateChange((_event, session) => {
            const updatedUser = session?.user ?? null;
            setUser(updatedUser);
            if (!updatedUser) router.replace("/login");
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    useEffect(() => {
        if (!user?.id) return;
        supabasebrowser
            .from('company')
            .select('*')
            .eq('user_id', user.id)
            .single()          // pega apenas um registro
            .then(({ data, error }) => {
                if (error) {
                    console.error('Erro ao buscar company:', error.message);
                    toast.error('Erro ao buscar company.');
                } else {
                    setCompany(data);
                }
            });
    }, [user]);

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
    const ALLOWED_TYPES = [
        "image/png",
        "image/jpeg",
        "image/jpeg",
        "application/pdf",
    ]
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError("")
        const file = e.target.files?.[0] ?? null
        if (file && !ALLOWED_TYPES.includes(file.type)) {
            setArquivo(null);
            setFileError("Formato não suportado. Apenas PNG, JPG ou PDF.");
            e.currentTarget.value = "";
            return;
        }
        if (file && file.size > MAX_FILE_SIZE) {
            setArquivo(null)
            setFileError("Arquivo muito grande (máx. 5 MB).")
            e.currentTarget.value = "" // limpa seleção
            return
        }
        setArquivo(file)
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            toast.error("Erro: usuário não autenticado.");
            return;
        }

        if (fileError) {
            toast.error(fileError)
            return
        }

        if (!motivo) {
            toast.error("Por favor, selecione um motivo.");
            return;
        }

        if (!company) {
            toast.error("Erro: empresa não encontrada.");
            return;
        }


        let attachmentPath: string | null = null;
        if (arquivo) {
            const filePath = `user_ticket/${Date.now()}_${arquivo.name}`;
            const { data: upData, error: upErr } = await supabasebrowser
                .storage
                .from("ticket-attachments")
                .upload(filePath, arquivo);

            if (upErr) {
                toast.error('Falha no upload do arquivo.');
                setFileError("Falha no upload do arquivo.");
                return;
            }

            attachmentPath = upData.path;
        }

        const res = await fetch("/api/support/new", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                title: titulo,
                reason: motivo,
                description: descricao,
                attachmentPath,
                company_id: company.id
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            toast.error("Erro: " + err.error);
        } else {
            toast.success("Chamado criado!");
            router.push("/dashboard/support");
        }


    }

    if (!user) return <p className="text-center py-10">Carregando...</p>;

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
            <div className="h-full w-full max-w-lg">
                <Link href="/dashboard/support">
                    <Button variant="ghost" className="mb-4">
                        ← Voltar
                    </Button>
                </Link>
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md bg-white p-6 rounded-lg shadow"
                >
                    <CardTitle className="text-xl font-semibold text-gray-800 mb-6">Novo Chamado</CardTitle>

                    <label className="block mb-1">Título do Chamado</label>
                    <Input
                        value={titulo}
                        onChange={e => setTitulo(e.target.value)}
                        placeholder="Digite o título"
                        required
                        maxLength={100}
                        className="mb-4"
                    />

                    <label className="block mb-1">Motivo</label>
                    <Select onValueChange={setMotivo} value={motivo}>
                        <SelectTrigger className="w-full mb-4">
                            <SelectValue placeholder="Selecione o motivo" />
                        </SelectTrigger>
                        <SelectContent>
                            {motivos.map(m => (
                                <SelectItem key={m.value} value={m.value}>
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <label className="block mb-1">Descrição</label>
                    <Textarea
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                        placeholder="Explique em detalhes"
                        required
                        rows={5}
                        maxLength={800}
                        className="mb-4"
                    />

                    <label className="block mb-1">Anexo (PNG, JPG, PDF)</label>
                    <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={handleFileChange}
                        className="mb-6 text-blue-600 hover:text-blue-800"
                    />

                    {fileError && <p className="text-sm text-destructive mb-4">{fileError}</p>}

                    <Button type="submit" className="w-full">
                        Enviar
                    </Button>
                </form>
            </div>
        </main>
    )
}
