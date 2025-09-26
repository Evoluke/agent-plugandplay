export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { supabaseadmin } from "@/lib/supabaseAdmin";
import { getCompanyIdByUser } from "@/lib/company";

export async function GET() {
  const { user, error } = await getUserFromCookie();
  if (error || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyResult = await getCompanyIdByUser(user.id);
  if ("error" in companyResult) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  const { data, error: dbError } = await supabaseadmin
    .from("pipeline")
    .select(
      `id, name, created_at,
      stages:stage(
        id,
        name,
        position,
        created_at,
        cards:card(
          id,
          title,
          company_name,
          value,
          status,
          priority,
          position,
          created_at,
          updated_at
        )
      )`
    )
    .eq("company_id", companyResult.companyId)
    .order("created_at", { ascending: true })
    .order("position", { foreignTable: "stage", ascending: true })
    .order("position", { foreignTable: "stage.card", ascending: true });

  if (dbError) {
    return NextResponse.json({ error: "Erro ao carregar funis" }, { status: 500 });
  }

  return NextResponse.json({ pipelines: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { user, error } = await getUserFromCookie();
  if (error || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyResult = await getCompanyIdByUser(user.id);
  if ("error" in companyResult) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Informe um nome para o funil" }, { status: 400 });
  }

  const { data, error: insertError } = await supabaseadmin
    .from("pipeline")
    .insert({
      name,
      company_id: companyResult.companyId,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Não foi possível criar o funil" }, { status: 500 });
  }

  return NextResponse.json({ pipeline: data });
}
