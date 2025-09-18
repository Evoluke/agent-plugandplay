import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { getUserFromCookie } from '@/lib/auth';
import { createNotification, getNotifications, markAsRead } from '@/lib/notifications';

export async function GET() {
  const { user, error } = await getUserFromCookie();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createRouteHandlerClient({ cookies });
  const { data: company, error: companyError } = await supabase
    .from('company')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (companyError || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }
  const { data, error: dbError } = await getNotifications(supabase, company.id);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { user, error } = await getUserFromCookie();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createRouteHandlerClient({ cookies });
  const { data: company, error: companyError } = await supabase
    .from('company')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (companyError || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }
  const { message, type } = await req.json();
  const { data, error: dbError } = await createNotification(supabase, company.id, message, type);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await getUserFromCookie();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createRouteHandlerClient({ cookies });
  const { data: company, error: companyError } = await supabase
    .from('company')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (companyError || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }
  const { id } = await req.json();
  const { error: dbError } = await markAsRead(supabase, id, company.id);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
