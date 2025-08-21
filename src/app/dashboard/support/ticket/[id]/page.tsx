// src/app/dashboard/support/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabasebrowser } from "@/lib/supabaseClient";

interface Ticket {
    id: string;
    title: string;
    description: string;
    created_at: string;
    resolved_in: string | null;
    attachment_url: string | null;
    reason: string | null;
    support_return: string | null;
}

export default function TicketPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [user, setUser] = useState<User | null>(null);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        supabasebrowser.auth.getUser().then(({ data, error }) => {
            if (!error && data.user) setUser(data.user);
        });
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        (async () => {
            try {
                if (!id) throw new Error("ID inválido");
                const { data, error } = await supabase
                    .from("tickets")
                    .select("*, company!inner(id)")
                    .eq("id", id)
                    .eq("company.user_id", user.id)
                    .single();
                if (error) throw error;
                setTicket(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Erro desconhecido");
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [user, id]);

    if (loading) return <p className="text-center py-10">Carregando...</p>;
    if (error) return <p className="text-red-600 py-10">Erro: {error}</p>;
    if (!ticket) return <p className="text-center py-10">Chamado não encontrado.</p>;

    return (
        <div className="bg-[#FAFAFA] flex items-center justify-center py-6">
            <div className="w-full px-4 sm:max-w-md md:max-w-lg">
                <Link href="/dashboard/support">
                    <Button variant="ghost" className="mb-4">← Voltar</Button>
                </Link>

                <Card className="border shadow-lg rounded-lg overflow-hidden mb-6">
                    <CardHeader className="bg-white px-6 py-4 border-b">
                        <CardTitle className="text-xl font-semibold text-center">
                            Detalhes do Chamado
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 text-sm">
                        <section>
                            <h2 className="font-medium">Título</h2>
                            <p>{ticket.title}</p>
                        </section>
                        <section>
                            <h2 className="font-medium">Motivo</h2>
                            <p>{ticket.reason}</p>
                        </section>
                        <section>
                            <h2 className="font-medium">Descrição</h2>
                            <p>{ticket.description}</p>
                        </section>
                        <section>
                            <h2 className="font-medium">Status</h2>
                            <p>
                                {!ticket.resolved_in
                                    ? `Aberto em ${new Date(ticket.created_at).toLocaleDateString("pt-BR")}`
                                    : `Resolvido em ${ticket.resolved_in
                                        ? new Date(ticket.resolved_in).toLocaleDateString("pt-BR")
                                        : "(data não informada)"}`
                                }</p>
                        </section>
                        {ticket.attachment_url && (
                            <section>
                                <h2 className="font-medium">Anexo</h2>
                                <a
                                    href={ticket.attachment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    Baixar arquivo
                                </a>
                            </section>
                        )}
                    </CardContent>
                </Card>

                {ticket.support_return && (
                    <Card className="border shadow-lg rounded-lg overflow-hidden">
                        <CardHeader className="bg-white px-6 py-4 border-b">
                            <CardTitle className="text-lg font-semibold text-center">
                                Resposta do Suporte
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <p>{ticket.support_return}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
