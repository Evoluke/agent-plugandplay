// src/app/dashboard/payments/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from 'next/link';
import { supabasebrowser } from '@/lib/supabaseClient';

interface Payment {
    id: string;
    reference: string;
    due_date: string;
    amount: number;
    usage: number;
    created_at: string;
    status: "pendente" | "pago";
    payment_link: string | null;
}

export default function PaymentPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const [user, setUser] = useState<{ id: string } | null>(null);

    const handleGenerateLink = async () => {
        if (isGenerating || paymentLink || !payment) return;
        setIsGenerating(true);
        try {
            const date = new Date(payment.due_date).toISOString().slice(0, 10);
            const total = payment.amount;

            const {
                data: { session },
                error: sessionError,
            } = await supabasebrowser.auth.getSession();
            if (sessionError || !session) throw new Error("Sessão não encontrada");

            const res = await fetch("/api/payments/pay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ id, date, total }),
            });
            if (!res.ok) throw await res.text();
            const { asaas } = await res.json();
            setPaymentLink(asaas.invoiceUrl || asaas.paymentLink);
        } catch (err: unknown) {
            console.error('Erro ao gerar link de pagamento:', err);
            toast.error('Erro ao gerar link de pagamento. Tente novamente mais tarde.');
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        supabasebrowser.auth.getUser().then(({ data, error }) => {
            if (error || !data?.user) {
                toast.error("Erro ao buscar usuário.");
            } else {

                setUser({ id: data.user.id });
            }
        });
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        const userId = user.id;
        async function load() {
            try {
                if (!id) throw new Error("ID inválido");
                const { data, error } = await supabase
                    .from("payments")
                    .select("*, company!inner(id)")
                    .eq("id", id)
                    .eq('company.user_id', userId)
                    .single();
                if (error) throw error;
                setPayment(data as Payment);
                setPaymentLink((data as Payment).payment_link);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        }
        load();
      }, [user, id]);

      useEffect(() => {
          if (payment && !paymentLink && !isGenerating) {
              handleGenerateLink();
          }
          // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [payment, paymentLink, isGenerating]);

      if (loading) return <p className="text-center py-10 min-h-screen flex items-center justify-center">Carregando...</p>;
      if (error) return <p className="text-red-600 py-10 min-h-screen flex items-center justify-center">Erro: {error}</p>;
      if (!payment) return <p className="text-center py-10 min-h-screen flex items-center justify-center">Pagamento não encontrado.</p>;
      if (payment.status === "pago") {
          return (
            <Card className="max-w-md mx-auto mt-10">
                <CardHeader>
                    <CardTitle>Pagamento já quitado</CardTitle>
                </CardHeader>
                <CardContent>
                    O pagamento de <strong>{payment.reference}</strong> já foi processado.
                </CardContent>
            </Card>
        );
    }


    return (
        <div className=" bg-[#FAFAFA] flex items-center justify-center p-6">
            <div className="h-full w-full max-w-lg">
                <Link href="/dashboard/payments">
                    <Button variant="ghost" className="mb-4">
                        ← Voltar
                    </Button>
                </Link>
                <Card className="border shadow-lg rounded-lg overflow-hidden">
                    <CardHeader className="bg-white px-6 py-4 border-b">
                        <CardTitle className="text-xl font-semibold text-gray-800 text-center">Detalhes do Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Dados do Pagamento */}
                        <section className="space-y-2">
                            <h2 className="text-sm font-semibold text-gray-700">Dados do Pagamento</h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <span className="font-medium text-gray-600">Referência:</span>
                                <span>{payment.reference}</span>
                                <span className="font-medium text-gray-600">Data Referência:</span>
                                <span>{new Date(payment.created_at).toLocaleDateString("pt-BR")}</span>
                                <span className="font-medium text-gray-600">Vencimento:</span>
                                <span>{new Date(payment.due_date).toLocaleDateString("pt-BR")}</span>
                                <span className="font-medium text-gray-600">Valor Base:</span>
                                <span className="border-t pt-1">R${(payment.amount).toFixed(2)}</span>
                            </div>
                        </section>

                        <Button
                            onClick={handleGenerateLink}
                            disabled={isGenerating || !!paymentLink}
                            className="w-full"
                        >
                            Gerar link de pagamento
                        </Button>

                        {/* Exibe link quando disponível */}
                        {paymentLink && (
                            <a
                                href={paymentLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mt-2 text-center text-blue-600 underline"
                            >
                                Abrir link de pagamento
                            </a>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
