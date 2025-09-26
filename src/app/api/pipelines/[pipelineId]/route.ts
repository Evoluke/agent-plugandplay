export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { getCompanyIdByUser } from "@/lib/company";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export async function PATCH(request: NextRequest, { params }: { params: { pipelineId: string } }) {
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

  const { error: updateError } = await supabaseadmin
    .from("pipeline")
    .update({ name })
    .eq("id", params.pipelineId)
    .eq("company_id", companyResult.companyId);

  if (updateError) {
    return NextResponse.json({ error: "Não foi possível atualizar o funil" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { pipelineId: string } }) {
  const { user, error } = await getUserFromCookie();
  if (error || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyResult = await getCompanyIdByUser(user.id);
  if ("error" in companyResult) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  const { error: deleteError } = await supabaseadmin
    .from("pipeline")
    .delete()
    .eq("id", params.pipelineId)
    .eq("company_id", companyResult.companyId);

  if (deleteError) {
    return NextResponse.json({ error: "Não foi possível remover o funil" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
