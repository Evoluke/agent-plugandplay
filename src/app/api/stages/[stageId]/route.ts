export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { getCompanyIdByUser } from "@/lib/company";
import { supabaseadmin } from "@/lib/supabaseAdmin";

async function getStageWithPipeline(stageId: string, companyId: number) {
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

export async function PATCH(request: NextRequest, { params }: { params: { stageId: string } }) {
  const { user, error } = await getUserFromCookie();
  if (error || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyResult = await getCompanyIdByUser(user.id);
  if ("error" in companyResult) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  const validation = await getStageWithPipeline(params.stageId, companyResult.companyId);
  if ("error" in validation) {
    return NextResponse.json({ error: "Estágio não encontrado" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Informe um nome para o estágio" }, { status: 400 });
  }

  const { error: updateError } = await supabaseadmin
    .from("stage")
    .update({ name })
    .eq("id", params.stageId);

  if (updateError) {
    return NextResponse.json({ error: "Não foi possível atualizar o estágio" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { stageId: string } }) {
  const { user, error } = await getUserFromCookie();
  if (error || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyResult = await getCompanyIdByUser(user.id);
  if ("error" in companyResult) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  const validation = await getStageWithPipeline(params.stageId, companyResult.companyId);
  if ("error" in validation) {
    return NextResponse.json({ error: "Estágio não encontrado" }, { status: 404 });
  }

  const { error: deleteError } = await supabaseadmin
    .from("stage")
    .delete()
    .eq("id", params.stageId);

  if (deleteError) {
    return NextResponse.json({ error: "Não foi possível remover o estágio" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
