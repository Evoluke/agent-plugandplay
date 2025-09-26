export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { getCompanyIdByUser } from "@/lib/company";
import { supabaseadmin } from "@/lib/supabaseAdmin";

async function validateCard(cardId: string, companyId: number) {
  const { data, error } = await supabaseadmin
    .from("card")
    .select("id, stage:stage_id(id, pipeline:pipeline_id(company_id))")
    .eq("id", cardId)
    .maybeSingle();

  if (error || !data) {
    return { error: error ?? new Error("Cartão não encontrado") } as const;
  }

  const pipelineCompanyId = (data as unknown as { stage: { pipeline: { company_id: number } | null } | null })?.stage?.pipeline?.company_id;

  if (pipelineCompanyId !== companyId) {
    return { error: new Error("Cartão não pertence à empresa") } as const;
  }

  return { card: data } as const;
}

export async function PATCH(request: NextRequest, { params }: { params: { cardId: string } }) {
  const { user, error } = await getUserFromCookie();
  if (error || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyResult = await getCompanyIdByUser(user.id);
  if ("error" in companyResult) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  const validation = await validateCard(params.cardId, companyResult.companyId);
  if ("error" in validation) {
    return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const updates: Record<string, unknown> = {};

  if (typeof body?.title === "string") {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Informe um título" }, { status: 400 });
    }
    updates.title = title;
  }

  if ("company_name" in (body ?? {})) {
    updates.company_name =
      typeof body?.company_name === "string" && body.company_name.trim()
        ? body.company_name.trim()
        : null;
  }

  if ("status" in (body ?? {})) {
    updates.status = typeof body?.status === "string" && body.status.trim() ? body.status.trim() : null;
  }

  if ("priority" in (body ?? {})) {
    updates.priority =
      typeof body?.priority === "string" && body.priority.trim() ? body.priority.trim() : null;
  }

  if ("value" in (body ?? {})) {
    const rawValue = body?.value;
    if (typeof rawValue === "number") {
      updates.value = Number.isFinite(rawValue) ? rawValue : null;
    } else if (typeof rawValue === "string" && rawValue.trim()) {
      const parsed = Number(rawValue.replace(/\./g, "").replace(/,/g, "."));
      updates.value = Number.isNaN(parsed) ? null : parsed;
    } else {
      updates.value = null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { error: updateError } = await supabaseadmin
    .from("card")
    .update(updates)
    .eq("id", params.cardId);

  if (updateError) {
    return NextResponse.json({ error: "Não foi possível atualizar o cartão" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { cardId: string } }) {
  const { user, error } = await getUserFromCookie();
  if (error || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyResult = await getCompanyIdByUser(user.id);
  if ("error" in companyResult) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  const validation = await validateCard(params.cardId, companyResult.companyId);
  if ("error" in validation) {
    return NextResponse.json({ error: "Cartão não encontrado" }, { status: 404 });
  }

  const { error: deleteError } = await supabaseadmin
    .from("card")
    .delete()
    .eq("id", params.cardId);

  if (deleteError) {
    return NextResponse.json({ error: "Não foi possível remover o cartão" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
