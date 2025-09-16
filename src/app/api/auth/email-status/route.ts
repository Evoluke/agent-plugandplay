import { NextResponse } from 'next/server';
import { supabaseadmin } from '@/lib/supabaseAdmin';
import { isValidEmail } from '@/lib/validators';

export async function POST(req: Request) {
  let email: string | undefined;

  try {
    const body = await req.json();
    if (body && typeof body.email === 'string') {
      email = body.email;
    }
  } catch (err) {
    console.error('Erro ao ler payload de verificação de e-mail:', err);
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
  }

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseadmin.auth.admin.getUserByEmail(email);

    if (error) {
      const message = error.message?.toLowerCase() ?? '';
      const status = (error as { status?: number }).status;
      if (status === 404 || message.includes('not found')) {
        return NextResponse.json({ status: 'not_found' });
      }

      console.error('Erro ao buscar usuário por e-mail:', error);
      return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
    }

    const user = data?.user;
    if (!user) {
      return NextResponse.json({ status: 'not_found' });
    }

    const isConfirmed = Boolean(user.email_confirmed_at);

    return NextResponse.json({ status: isConfirmed ? 'confirmed' : 'unconfirmed' });
  } catch (err) {
    console.error('Erro inesperado ao verificar status do e-mail:', err);
    return NextResponse.json({ error: 'Erro ao verificar e-mail' }, { status: 500 });
  }
}
