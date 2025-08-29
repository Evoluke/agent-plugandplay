// app/support/new/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabasebrowser } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        supabasebrowser.auth.getUser().then(({ data, error }) => {
            if (!error && data.user) setUser(data.user);
        });
    }, []);

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
        if (isSubmitting) return;

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

        setIsSubmitting(true);
        try {
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
        } finally {
            setIsSubmitting(false);
        }

    }

    if (!user) return <p className="text-center py-10">Carregando...</p>;

    return (
        <div className="bg-[#FAFAFA] flex items-center justify-center py-6">
            <div className="w-full px-4 sm:max-w-md md:max-w-lg">
                <Link href="/dashboard/support">
                    <Button variant="ghost" className="mb-4">
                        ← Voltar
                    </Button>
                </Link>
                <Card className="border shadow-lg rounded-lg overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="bg-white px-6 py-4 border-b mb-2">
                            <CardTitle className="text-xl font-semibold text-gray-800 text-center">Novo Chamado</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="block mb-1">Título do Chamado</label>
                                <Input
                                    value={titulo}
                                    onChange={e => setTitulo(e.target.value)}
                                    placeholder="Digite o título"
                                    required
                                    maxLength={100}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block mb-1">Motivo</label>
                                <Select onValueChange={setMotivo} value={motivo}>
                                    <SelectTrigger className="w-full">
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
                            </div>
                            <div className="space-y-2">
                                <label className="block mb-1">Descrição</label>
                                <Textarea
                                    value={descricao}
                                    onChange={e => setDescricao(e.target.value)}
                                    placeholder="Explique em detalhes"
                                    required
                                    rows={5}
                                    maxLength={800}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block mb-1">Anexo (PNG, JPG, PDF)</label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".png,.jpg,.jpeg,.pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {arquivo ? "Trocar arquivo" : "Selecionar arquivo"}
                                    </Button>
                                    {arquivo && (
                                        <p className="text-sm text-gray-600 break-words">
                                            {arquivo.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {fileError && <p className="text-sm text-destructive">{fileError}</p>}
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Enviando..." : "Enviar"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
