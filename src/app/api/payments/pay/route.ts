// src/app/api/payments/pay/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseadmin } from '@/lib/supabaseAdmin';

const rateLimitMap = new Map<string, { count: number; last: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.slice(7).trim();
  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = userData.user.id;

  const now = Date.now();
  const entry = rateLimitMap.get(userId) ?? { count: 0, last: now };
  if (now - entry.last > WINDOW_MS) {
    entry.count = 0;
    entry.last = now;
  }
  entry.count++;
  rateLimitMap.set(userId, entry);
  if (entry.count > MAX_REQUESTS) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { id, date, total } = await request.json();

  if (typeof id !== 'string' || !id.trim()) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  if (
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(new Date(date).getTime())
  ) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }
  if (typeof total !== 'number' || total <= 0) {
    return NextResponse.json({ error: 'Invalid total' }, { status: 400 });
  }

  const requestedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate =
    requestedDate < today
      ? today.toISOString().slice(0, 10)
      : date;

  console.log(`[payment] user=${userId} id=${id} total=${total}`);

  const { data: company, error: companyError } = await supabaseadmin
    .from('company')
    .select(
      'company_name, company_profile!inner(cpf_cnpj, responsible_name, phone)'
    )
    .eq('user_id', userId)
    .single();

  if (companyError || !company) {
    return NextResponse.json(
      { error: 'Company profile not found' },
      { status: 400 }
    );
  }

  const { company_name, company_profile } = company as {
    company_name: string | null;
    company_profile: {
      cpf_cnpj: string;
      responsible_name: string;
      phone: string;
    }[];
  };

  const profile = company_profile?.[0];
  if (!profile) {
    return NextResponse.json(
      { error: 'Company profile not found' },
      { status: 400 }
    );
  }

  const cpfCnpj = profile.cpf_cnpj;
  const phone = profile.phone;
  const name = company_name || profile.responsible_name;
  const email = userData.user.email;

  let customerId: string | null = null;

  const searchResp = await fetch(
    `${process.env.ASAAS_API_URL}/customers?cpfCnpj=${cpfCnpj}`,
    {
      headers: {
        access_token: process.env.ASAAS_API_KEY!,
        'User-Agent': 'Evoluke',
      },
    }
  );
  const searchData = await searchResp.json();

  if (searchResp.ok && Array.isArray(searchData.data) && searchData.data.length) {
    customerId = searchData.data[0].id as string;
  } else {
    const createResp = await fetch(
      `${process.env.ASAAS_API_URL}/customers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: process.env.ASAAS_API_KEY!,
          'User-Agent': 'Evoluke',
        },
        body: JSON.stringify({
          name,
          email,
          cpfCnpj,
          mobilePhone: phone,
        }),
      }
    );
    const createData = await createResp.json();
    if (!createResp.ok) {
      return NextResponse.json({ error: createData }, { status: 400 });
    }
    customerId = createData.id as string;
  }

  const endpoint = `${process.env.ASAAS_API_URL}/payments`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      access_token: process.env.ASAAS_API_KEY!,
      'User-Agent': 'Evoluke',
    },
    body: JSON.stringify({
      customer: customerId,
      billingType: 'UNDEFINED',
      dueDate,
      value: total,
      description: `Pagamento ${id}`,
      postalService: false,
      externalReference: id,
    }),
  });
  const data = await resp.json();

  if (!resp.ok) return NextResponse.json({ error: data }, { status: 400 });

  return NextResponse.json({ success: true, asaas: data });
}
