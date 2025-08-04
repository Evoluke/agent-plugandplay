// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
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

  const { data, error } = await supabaseadmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  const userId = data.user.id;
  // 2) insere na tabela business (service role key ignora RLS)
  const { error: bizError } = await supabaseadmin
    .from('company')
    .insert({ user_id: userId, company_name: name, profile_complete: false });
  if (bizError) {
    return NextResponse.json({ error: bizError.message }, { status: 500 });
  }

  return NextResponse.json({ user: data.user }, { status: 201 });
}