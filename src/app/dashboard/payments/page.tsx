// src/app/payments/page.tsx
"use client";

import { supabasebrowser } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

type Payment = {
  id: string;
  amount: number;
  status: 'pendente' | 'pago' | 'estorno';
  created_at: string;
  due_date: string;
  reference: string;
};

type User = {
  id: string;
};


export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);


  useEffect(() => {
    supabasebrowser.auth.getUser().then(({ data, error }) => {
      if (error || !data?.user) {
        toast.error("Erro ao buscar usuário.");
      } else {

        setUser(data.user as User);
      }
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchPayments = async () => {
      const { data, error } = await supabasebrowser
        .from('payments')
        .select(`
        id,
        amount,
        status,
        paid_in,
        created_at,
        due_date,
        reference,
        company!inner(id)
      `)
        // filtra por company.user_id sem precisar de outro .select()
        .eq('company.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar payments:', error);
        return;
      }

      setPayments(data);
    };

    fetchPayments();
  }, [user]);



  if (!user || !payments) return null;

  const handlePay = (id: string) => {
    setIsNavigating(true);
    try {
      router.push(`/dashboard/payments/${id}/`);
    } catch (error) {
      setIsNavigating(false);
      toast.error("Falha ao navegar.");
    }
  };

  return (
    <div className="p-4 space-y-6 w-full max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Controle de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-4 py-2">Referência</th>
                  <th className="px-4 py-2">Data Referência</th>
                  <th className="px-4 py-2">Vencimento</th>
                  <th className="px-4 py-2">Valor (R$)</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-[#FAFAFA]">
                    <td className="px-4 py-2">{p.reference}</td>
                    <td className="px-4 py-2">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-2">{new Date(p.due_date).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-2">R${p.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      {p.status === "pago" ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Quitado
                        </span>
                      ) : p.status === "estorno" ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Estornado
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePay(p.id)}
                          className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          disabled={isNavigating}
                        >
                          {isNavigating ? "Pagar" : "Pagar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-4 sm:hidden">
            {payments.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Referência</span>
                    <span>{p.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Data Referência</span>
                    <span>{new Date(p.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Vencimento</span>
                    <span>{new Date(p.due_date).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Valor (R$)</span>
                    <span>R${p.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status</span>
                    {p.status === "pago" ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Quitado
                      </span>
                    ) : p.status === "estorno" ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Estornado
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePay(p.id)}
                        className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        disabled={isNavigating}
                      >
                        {isNavigating ? "Pagar" : "Pagar"}
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {payments.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Nenhum pagamento encontrado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
