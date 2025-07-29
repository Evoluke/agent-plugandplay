// src/app/payments/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabasebrowser } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BudgetCard } from "@/components/ui/budget-card";

type Payment = {
  id: string;
  referencia: string;
  due_date: string;    // string no formato ISO
  amount: number;
  usage: number;
  status: "pendente" | "quitado";
};

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      const { data, error } = await supabasebrowser
        .from("payments")
        .select("*")
        .order("due_date", { ascending: false });

      if (error) throw error;
      setPayments(data as Payment[]);  // cast aqui

      if (error) {
        console.error("Erro ao carregar pagamentos:", error);
      } else {
        setPayments(data);
      }
      setLoading(false);
    }
    fetchPayments();
  }, []);

  // orçamento e alertas (mantido como antes)
  const monthlyBudget = 2000;
  const spent = payments.reduce((sum, p) => sum + p.usage, 0);
  const month = new Date().toLocaleString("pt-BR", { month: "long" });
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const resetInDays = lastDayOfMonth.getDate() - today.getDate();
  const alerts = [
    { threshold: 80, label: "usage alert" },
    { threshold: 100, label: "usage alert" },
  ];

  const handlePay = (id: string) => router.push(`/dashboard/payments/${id}/`);

  if (loading) {
    return <p className="p-4 text-center">Carregando pagamentos...</p>;
  }

  return (
    <div className="p-4 space-y-6 w-4/5 mx-auto">
      <BudgetCard
        title="Orçamento Mensal"
        periodLabel={month}
        spent={spent}
        budget={monthlyBudget}
        resetInDays={resetInDays}
        alerts={alerts}
        onAddAlert={() => { }}
        onEditBudget={() => { }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Controle de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Referência</th>
                <th className="px-4 py-2">Vencimento</th>
                <th className="px-4 py-2">Preço base (R$)</th>
                <th className="px-4 py-2">Utilização (R$)</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{p.referencia}</td>
                  <td className="px-4 py-2">
                    {new Date(p.due_date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-2">R${p.amount.toFixed(2)}</td>
                  <td className="px-4 py-2">R${p.usage.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    {p.status === "quitado" ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Quitado
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePay(p.id)}
                        className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      >
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
