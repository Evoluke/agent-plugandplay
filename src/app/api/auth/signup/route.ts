// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseadmin } from "@/lib/supabaseAdmin";
import {
  isValidCompanyName,
  isValidEmail,
  isValidPassword,
} from "@/lib/validators";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  if (!isValidCompanyName(name)) {
    return NextResponse.json(
      { error: "Nome da empresa deve ter entre 4 e 80 caracteres" },
      { status: 400 },
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Email inválido" },
      { status: 400 },
    );
  }
  if (!isValidPassword(password)) {
    return NextResponse.json(
      {
        error:
          "Senha deve ter ao menos 8 caracteres com maiúsculas, minúsculas, número e símbolo",
      },
      { status: 400 },
    );
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: "http://localhost:3000/auth/callback",
    },
  });

  if (error || !data.user) {
    console.error('Erro ao criar usuário:', error?.message);
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 409 });
  }

  const userId = data.user.id;
  // 2) insere na tabela business (service role key ignora RLS)
  const { error: bizError } = await supabaseadmin
    .from('company')
    .insert({ user_id: userId, company_name: name, profile_complete: false });
  if (bizError) {
    console.error('Erro ao criar company:', bizError.message);
    return NextResponse.json({ error: 'Erro ao criar company' }, { status: 500 });
  }

  return NextResponse.json(
    {
      message:
        'Usuário criado. Um e-mail de verificação foi enviado para confirmar o cadastro.',
    },
    { status: 201 },
  );
}