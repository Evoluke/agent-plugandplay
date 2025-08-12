export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseadmin } from '@/lib/supabaseAdmin';
import { AGENT_UPDATE_FEE } from '@/lib/payments';

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

  const { agentId } = await request.json();
  if (typeof agentId !== 'string' || !agentId) {
    return NextResponse.json({ error: 'Invalid agentId' }, { status: 400 });
  }

  const { data: agent, error: agentError } = await supabaseadmin
    .from('agents')
    .select('company_id')
    .eq('id', agentId)
    .single();

  if (agentError || !agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  const { data: company, error: companyError } = await supabaseadmin
    .from('company')
    .select('id')
    .eq('id', agent.company_id)
    .eq('user_id', userId)
    .single();

  if (companyError || !company) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data: existing, error: paymentError } = await supabaseadmin
    .from('payments')
    .select('id')
    .eq('agent_id', agentId)
    .neq('status', 'pago')
    .limit(1);

  if (paymentError) {
    return NextResponse.json({ error: 'Failed to check payments' }, { status: 500 });
  }

  if (!existing || existing.length === 0) {
    const dueDate = new Date();
    const { error: insertError } = await supabaseadmin
      .from('payments')
      .insert({
        company_id: company.id,
        agent_id: agentId,
        amount: AGENT_UPDATE_FEE,
        due_date: dueDate.toISOString(),
        reference: `Atualização do agente ${agentId}`,
      });
    if (insertError) {
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

