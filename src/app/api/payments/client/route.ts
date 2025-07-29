// src/app/api/payments/client/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

const ASAAS_BASE = process.env.ASAAS_API_URL!;
const ASAAS_KEY = process.env.ASAAS_API_KEY!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const document = searchParams.get('document');
  if (!document) {
    return NextResponse.json({ error: 'Missing document (cpfCnpj)' }, { status: 400 });
  }

  // busca cliente pelo CPF/CNPJ
  const resp = await fetch(
    `${ASAAS_BASE}/customers?cpfCnpj=${encodeURIComponent(document)}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_KEY,
        'User-Agent': 'Evoluke',
      },
    }
  );

  const data = await resp.json();
  if (!resp.ok) {
    return NextResponse.json({ error: data }, { status: resp.status });
  }

  return NextResponse.json({ success: true, customers: data });
}

export async function POST(request: Request) {
  const { name, email, cpfCnpj, phone, externalReference } = await request.json();

  if (!name || !cpfCnpj) {
    return NextResponse.json(
      { error: 'Missing required fields: name and cpfCnpj' },
      { status: 400 }
    );
  }

  // cria novo cliente
  const resp = await fetch(`${ASAAS_BASE}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_KEY,
      'User-Agent': 'Evoluke',
    },
    body: JSON.stringify({
      name,
      email,
      cpfCnpj,
      phone,
      externalReference,
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    return NextResponse.json({ error: data }, { status: resp.status });
  }

  return NextResponse.json({ success: true, customer: data });
}
