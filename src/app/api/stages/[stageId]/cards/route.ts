export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { getCompanyIdByUser } from "@/lib/company";
import { supabaseadmin } from "@/lib/supabaseAdmin";

async function validateStage(stageId: string, companyId: number) {
  const { data, error } = await supabaseadmin
    .from("stage")
    .select("id, pipeline:pipeline_id(id, company_id)")
    .eq("id", stageId)
    .maybeSingle();

  if (error || !data) {
    return { error: error ?? new Error("Estágio não encontrado") } as const;
  }

  const pipelineCompanyId = (data as unknown as { pipeline: { company_id: number } | null })?.pipeline?.company_id;

  if (pipelineCompanyId !== companyId) {
    return { error: new Error("Estágio não pertence à empresa") } as const;
  }

  return { stage: data } as const;
}

export async function POST(request: NextRequest, { params }: { params: { stageId: string } }) {
  const { user, error } = await getUserFromCookie();
  if (error || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyResult = await getCompanyIdByUser(user.id);
  if ("error" in companyResult) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  const validation = await validateStage(params.stageId, companyResult.companyId);
  if ("error" in validation) {
    return NextResponse.json({ error: "Estágio não encontrado" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const companyName = typeof body?.company_name === "string" ? body.company_name.trim() : null;
  const status = typeof body?.status === "string" ? body.status.trim() : null;
  const priority = typeof body?.priority === "string" ? body.priority.trim() : null;
  const rawValue = body?.value;
  let value: number | null = null;
  if (typeof rawValue === "number") {
    value = Number.isFinite(rawValue) ? rawValue : null;
  } else if (typeof rawValue === "string" && rawValue.trim()) {
    const parsed = Number(rawValue.replace(/\./g, "").replace(/,/g, "."));
    value = Number.isNaN(parsed) ? null : parsed;
  }

  if (!title) {
    return NextResponse.json({ error: "Informe um título para o cartão" }, { status: 400 });
  }

  const { data: lastCard } = await supabaseadmin
    .from("card")
    .select("position")
    .eq("stage_id", params.stageId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = typeof lastCard?.position === "number" ? lastCard.position + 1 : 0;

  const { data, error: insertError } = await supabaseadmin
    .from("card")
    .insert({
      title,
      company_name: companyName,
      status,
      priority,
      value,
      stage_id: params.stageId,
      position,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Não foi possível criar o cartão" }, { status: 500 });
  }

  return NextResponse.json({ card: data });
}
