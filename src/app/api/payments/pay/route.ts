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

  const body = await request.json();
  const { id, total } = body;
  let date = body.date;

  if (typeof id !== 'string' || !id.trim()) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  if (typeof date === 'string' && date.includes('T')) {
    date = new Date(date).toISOString().slice(0, 10);
  }

  if (
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(date) ||
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

  const { data: paymentRecord, error: paymentError } = await supabaseadmin
    .from('payments')
    .select('id, company_id, asaas_id, payment_link, due_date, amount')
    .or(`id.eq.${id},reference.eq.${id}`)
    .maybeSingle();
  if (paymentError) {
    console.error(paymentError);
  }
  if (!paymentRecord) {
    return NextResponse.json(
      { error: 'Payment not found' },
      { status: 404 }
    );
  }

  const { data: company, error: companyError } = await supabaseadmin
    .from('company')
    .select(
      'id, company_name, company_profile!inner(cpf_cnpj, responsible_name, phone)'
    )
    .eq('user_id', userId)
    .single();

  if (companyError || !company) {
    return NextResponse.json(
      { error: 'Company profile not found' },
      { status: 400 }
    );
  }

  if (paymentRecord.company_id !== company.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (total !== paymentRecord.amount) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  if (paymentRecord.asaas_id && paymentRecord.payment_link) {
    return NextResponse.json({
      success: true,
      asaas: {
        id: paymentRecord.asaas_id,
        invoiceUrl: paymentRecord.payment_link,
        paymentLink: paymentRecord.payment_link,
        dueDate: paymentRecord.due_date,
      },
    });
  }

  const { company_name, company_profile } = company as unknown as {
    company_name: string | null;
    company_profile: {
      cpf_cnpj: string;
      responsible_name: string;
      phone: string;
    };
  };
  if (!company_profile) {
    return NextResponse.json(
      { error: 'Company profile not found' },
      { status: 400 }
    );
  }

  const cpfCnpj = company_profile.cpf_cnpj;
  const phone = company_profile.phone.replace(/^55/, '');
  const name = company_name || company_profile.responsible_name;
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
      value: paymentRecord.amount,
      description: `Pagamento ${id}`,
      postalService: false,
      externalReference: id,
    }),
  });
  const data = await resp.json();

  if (!resp.ok) return NextResponse.json({ error: data }, { status: 400 });

  await supabaseadmin
    .from('payments')
    .update({
      asaas_id: data.id,
      payment_link: data.invoiceUrl || data.paymentLink,
      due_date: data.dueDate || dueDate,
    })
    .eq('id', paymentRecord.id);

  return NextResponse.json({ success: true, asaas: data });
}
