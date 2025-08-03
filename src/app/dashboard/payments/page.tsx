// src/app/payments/page.tsx
"use client";

import { supabasebrowser } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


type Payment = {
  id: string;
  amount: number;
  status: 'pendente' | 'pago';
  created_at: string;
  due_date: string;
  reference: string;
};


export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [user, setUser] = useState<any>(null);


  useEffect(() => {
    supabasebrowser.auth.getUser().then(({ data, error }) => {
      if (error || !data?.user) {
        console.log("Erro ao buscar usuário.");
      } else {

        setUser(data.user);
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

  const handlePay = (id: string) => router.push(`/dashboard/payments/${id}/`);

  return (
    <div className="p-4 space-y-6 w-4/5 mx-auto">

      <Card>
        <CardHeader>
          <CardTitle>Controle de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Referência</th>
                <th className="px-4 py-2">Data Referência</th>    
                <th className="px-4 py-2">Vencimento</th>
                <th className="px-4 py-2">Valor (R$)</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{p.reference}</td>
                  <td className="px-4 py-2">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-2">{new Date(p.due_date).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-2">R${p.amount.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    {p.status === "pago" ? (
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
