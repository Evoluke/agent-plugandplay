// src/app/api/payments/client/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseadmin } from '@/lib/supabaseAdmin';
import {
  isValidCpfCnpj,
  isValidEmail,
  isValidPhone,
  isValidResponsible,
} from '@/lib/validators';

const ASAAS_BASE = process.env.ASAAS_API_URL!;
const ASAAS_KEY = process.env.ASAAS_API_KEY!;

async function getCompanyId(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 } as const;
  }
  const token = authHeader.split(' ')[1];
  const {
    data: { user },
    error: authError,
  } = await supabaseadmin.auth.getUser(token);

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 } as const;
  }

  const { data: company, error: companyError } = await supabaseadmin
    .from('company')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (companyError || !company) {
    return { error: 'Company not found', status: 404 } as const;
  }

  return { companyId: company.id } as const;
}

export async function GET(request: Request) {
  const companyRes = await getCompanyId(request);
  if ('error' in companyRes) {
    return NextResponse.json(
      { error: companyRes.error },
      { status: companyRes.status }
    );
  }

  const { companyId } = companyRes;

  const { searchParams } = new URL(request.url);
  const document = searchParams.get('document');
  if (!document) {
    return NextResponse.json({ error: 'Missing document (cpfCnpj)' }, { status: 400 });
  }

  const cleanDoc = document.replace(/\D/g, '');
  if (!isValidCpfCnpj(cleanDoc)) {
    return NextResponse.json({ error: 'Invalid document' }, { status: 400 });
  }

  // busca cliente pelo CPF/CNPJ
  const resp = await fetch(
    `${ASAAS_BASE}/customers?cpfCnpj=${encodeURIComponent(cleanDoc)}`,
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

  const customers = Array.isArray(data?.data)
    ? (data.data as { externalReference?: string }[]).filter(
        (c) => c.externalReference === String(companyId)
      )
    : [];

  return NextResponse.json({ success: true, customers });
}

export async function POST(request: Request) {
  const companyRes = await getCompanyId(request);
  if ('error' in companyRes) {
    return NextResponse.json(
      { error: companyRes.error },
      { status: companyRes.status }
    );
  }

  const { companyId } = companyRes;

  const { name, email, cpfCnpj, phone } = await request.json();

  if (!name || !cpfCnpj) {
    return NextResponse.json(
      { error: 'Missing required fields: name and cpfCnpj' },
      { status: 400 }
    );
  }

  const cleanName = name.trim();
  const cleanCpf = cpfCnpj.replace(/\D/g, '');
  const cleanPhone = phone
    ? phone.replace(/\D/g, '').replace(/^55/, '')
    : undefined;
  const cleanEmail = email?.trim();

  if (!isValidResponsible(cleanName)) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
  }
  if (cleanEmail && !isValidEmail(cleanEmail)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (!isValidCpfCnpj(cleanCpf)) {
    return NextResponse.json({ error: 'Invalid cpfCnpj' }, { status: 400 });
  }
  if (cleanPhone && !isValidPhone(cleanPhone)) {
    return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
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
      name: cleanName,
      email: cleanEmail,
      cpfCnpj: cleanCpf,
      phone: cleanPhone,
      externalReference: String(companyId),
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    return NextResponse.json({ error: data }, { status: resp.status });
  }

  return NextResponse.json({ success: true, customer: data });
}
