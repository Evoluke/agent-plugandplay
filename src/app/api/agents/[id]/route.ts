import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabaseadmin } from "@/lib/supabaseAdmin";

const allowedTypes = ["agendamento", "sdr", "suporte"] as const;
type AgentType = (typeof allowedTypes)[number];

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
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

  const { data: agent, error } = await supabaseadmin
    .from("agents")
    .select("id, name, type, is_active")
    .eq("id", params.id)
    .eq("company_id", company.id)
    .single();

  if (error || !agent) {
    return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
  }

  return NextResponse.json(agent, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

  const { name, type, is_active }: { name?: string; type?: AgentType; is_active?: boolean } = await req.json();

  if (
    name !== undefined &&
    (typeof name !== "string" || name.trim().length < 3 || name.trim().length > 80)
  ) {
    return NextResponse.json(
      { error: "Nome do agente deve ter entre 3 e 80 caracteres" },
      { status: 400 }
    );
  }

  if (type !== undefined && !allowedTypes.includes(type)) {
    return NextResponse.json(
      { error: "Tipo de agente inválido" },
      { status: 400 }
    );
  }

  const updates: Partial<{ name: string; type: AgentType; is_active: boolean }> = {};
  if (name !== undefined) updates.name = name.replace(/<[^>]*>?/gm, "").trim();
  if (type !== undefined) updates.type = type;
  if (is_active !== undefined) updates.is_active = is_active;

  const { error } = await supabaseadmin
    .from("agents")
    .update(updates)
    .eq("id", params.id)
    .eq("company_id", company.id);

  if (error) {
    console.error("Erro ao atualizar agente:", error.message);
    return NextResponse.json({ error: "Erro ao atualizar agente" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
