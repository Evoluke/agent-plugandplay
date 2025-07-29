// src/app/api/payments/pay/route.ts
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { id, bussines_id, date, total } = await request.json()

  const requestedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // se vencimento passado, usa hoje; senão, usa a data informada
  const dueDate =
    requestedDate < today
      ? today.toISOString().slice(0, 10)
      : date


  // 1) Cria cobrança no Asaas sandbox
  const resp = await fetch(
    process.env.ASAAS_API_URL!,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "User-Agent": "Evoluke",
        'access_token': process.env.ASAAS_API_KEY!
      },
      body: JSON.stringify({
        customer: '6889196',
        billingType: "UNDEFINED",
        dueDate: dueDate,
        value: total,
        description: `Pagamento ${id}`,
        postalService: false,
        externalReference: id
      })
    }
  )
  const data = await resp.json()
  if (!resp.ok) return NextResponse.json({ error: data }, { status: 400 })

  return NextResponse.json({ success: true, asaas: data })
}
