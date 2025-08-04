import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseadmin } from "@/lib/supabaseAdmin";

const allowedTypes = ["agendamento", "sdr", "suporte"] as const;

type AgentType = (typeof allowedTypes)[number];

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: company, error: companyError } = await supabase
    .from("company")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (companyError || !company) {
    return NextResponse.json(
      { error: companyError?.message || "Empresa não encontrada" },
      { status: 403 }
    );
  }

  const { name, type, company_id: requestedCompanyId }: { name?: string; type?: AgentType; company_id?: number } = await req.json();

  if (!name || typeof name !== "string" || name.trim().length < 3 || name.trim().length > 80) {
    return NextResponse.json(
      { error: "Nome do agente deve ter entre 3 e 80 caracteres" },
      { status: 400 }
    );
  }

  if (!type || !allowedTypes.includes(type)) {
    return NextResponse.json(
      { error: "Tipo de agente inválido" },
      { status: 400 }
    );
  }

  if (requestedCompanyId && requestedCompanyId !== company.id) {
    return NextResponse.json({ error: "Empresa inválida" }, { status: 403 });
  }

  const sanitizedName = name.replace(/<[^>]*>?/gm, "").trim();

  const { data, error } = await supabaseadmin
    .from("agents")
    .insert([
      {
        name: sanitizedName,
        type,
        company_id: company.id,
        is_active: false,
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao criar agente:", error.message);
    return NextResponse.json({ error: "Erro ao criar agente" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
