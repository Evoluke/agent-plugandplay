// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabasebrowser } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";

type Ticket = {
    id: string;
    title: string;
    created_at: string;
    resolved_in: string;
};

type FAQ = {
    question: string;
    answer: string;
};

const faqList: FAQ[] = [
    {
        question: "Como faço para atualizar meu perfil?",
        answer: "Acesse Configurações → Perfil e edite seus dados.",
    },
    {
        question: "Como posso redefinir minha senha?",
        answer: "Clique em “Esqueci minha senha” na tela de login.",
    },
    {
        question: "O que é a funcionalidade X?",
        answer: "A funcionalidade X permite que você …",
    },
    {
        question: "Mais uma pergunta frequente?",
        answer: "Resposta para outra pergunta.",
    },

];

export default function SupportPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);

    // 1) busca usuário
    useEffect(() => {
        supabasebrowser.auth
            .getUser()
            .then(({ data, error }) => {
                if (data?.user && !error) setUser(data.user);
            });
    }, []);

    // 2) busca chamados do usuário
    useEffect(() => {
        if (!user?.id) return;

        supabasebrowser
            .from("tickets")
            .select("id, title, created_at, resolved_in, company!inner(id)")
            .eq("company.user_id", user.id)
            .order("created_at", { ascending: false })
            .then(({ data }) => {
                if (data) setTickets(data);
            });
    }, [user]);


    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left panel */}
            <div className="space-y-4">

                <Button
                    onClick={() => router.push("/dashboard/support/new")}
                    className="w-full"
                >
                    Solicitar Chamado
                </Button>

                <h2 className="text-lg font-semibold">Meus Chamados</h2>
                <div className="space-y-2">
                    {tickets.length === 0 ? (
                        <p className="text-sm text-gray-500">Nenhum chamado encontrado.</p>
                    ) : (
                        tickets.map((t) => (
                            <Card
                                key={t.id}
                                onClick={() => router.push(`/dashboard/support/ticket/${t.id}`)}
                                className={`cursor-pointer   ${t.resolved_in
                                    ? "border-l-4 border-green-500"
                                    : "border shadow-sm hover:shadow-md"
                                    }
      `}
                            >
                                <CardHeader className="px-3 pt-3">
                                    <CardTitle className="text-sm font-medium">{t.title}</CardTitle>
                                    {t.resolved_in && (
                                        <span className="text-green-600 text-xs font-medium">Resolvido</span>
                                    )}
                                </CardHeader>
                                <CardContent className="px-3 pb-3 text-xs text-gray-600">
                                    Aberto em {new Date(t.created_at).toLocaleDateString("pt-BR")}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Right panel */}
            <div className="md:col-span-2 space-y-4">
                <h1 className="text-2xl font-bold">Perguntas Frequentes</h1>
                <div className="space-y-3">
                    {faqList.map((f, i) => (
                        <Card key={i}>
                            <CardHeader className="px-3 pt-3">
                                <CardTitle className="text-sm font-medium">Q: {f.question}</CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 pb-3 text-xs text-gray-600">
                                A: {f.answer}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
