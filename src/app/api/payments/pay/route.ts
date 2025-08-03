// src/app/api/payments/pay/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
   const { id, date, total } = await request.json()

  const requestedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // se vencimento passado, usa hoje; senão, usa a data informada
  const dueDate =
    requestedDate < today
      ? today.toISOString().slice(0, 10)
      : date


  // 1) Cria cobrança no Asaas sandbox
  const endpoint = `${process.env.ASAAS_API_URL}/payments`;   // ← adicione /payments
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': process.env.ASAAS_API_KEY!,
      'User-Agent': 'Evoluke'
    },
    body: JSON.stringify({
      customer: '6889196',
      billingType: 'UNDEFINED',
      dueDate,
      value: total,
      description: `Pagamento ${id}`,
      postalService: false,
      externalReference: id
    })
  });
  const data = await resp.json()


  if (!resp.ok) return NextResponse.json({ error: data }, { status: 400 })

  return NextResponse.json({ success: true, asaas: data })
}
