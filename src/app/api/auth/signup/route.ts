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
    },
  });
  if (error) {
    console.error("Erro ao criar usuário:", error.message);
    if (
      error.message?.includes("User already registered") ||
      error.status === 400
    ) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 409 }
    );
  }

  if (!data.user) {
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 409 }
    );
  }

  const userId = data.user.id;

  try {
    // 2) insere na tabela company (service role key ignora RLS)
    const { error: companyError } = await supabaseadmin
      .from("company")
      .insert({ user_id: userId, company_name: name, profile_complete: false });

    if (companyError) {
      console.error("Erro ao criar company:", companyError.message);
      // remove o usuário criado para garantir consistência
      const { error: deleteError } = await supabaseadmin.auth.admin.deleteUser(
        userId,
      );
      if (deleteError) {
        console.error(
          "Erro ao remover usuário após falha ao criar company:",
          deleteError.message,
        );
      }
      return NextResponse.json(
        { error: "Erro ao criar empresa, cadastro cancelado" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message:
          "Usuário criado. Um e-mail de verificação foi enviado para confirmar o cadastro.",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Erro inesperado ao criar company:", err);
    const { error: deleteError } = await supabaseadmin.auth.admin.deleteUser(
      userId,
    );
    if (deleteError) {
      console.error(
        "Erro ao remover usuário após exceção inesperada:",
        deleteError.message,
      );
    }
    return NextResponse.json(
      { error: "Erro inesperado ao criar empresa" },
      { status: 500 },
    );
  }
}