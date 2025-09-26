export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { getCompanyIdByUser } from "@/lib/company";
import { supabaseadmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest, { params }: { params: { pipelineId: string } }) {
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
    return NextResponse.json({ error: "Informe um nome para o estágio" }, { status: 400 });
  }

  const { data: pipeline, error: pipelineError } = await supabaseadmin
    .from("pipeline")
    .select("id")
    .eq("id", params.pipelineId)
    .eq("company_id", companyResult.companyId)
    .single();

  if (pipelineError || !pipeline) {
    return NextResponse.json({ error: "Funil não encontrado" }, { status: 404 });
  }

  const { data: lastPosition } = await supabaseadmin
    .from("stage")
    .select("position")
    .eq("pipeline_id", pipeline.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = typeof lastPosition?.position === "number" ? lastPosition.position + 1 : 0;

  const { data, error: insertError } = await supabaseadmin
    .from("stage")
    .insert({
      name,
      pipeline_id: pipeline.id,
      position,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Não foi possível criar o estágio" }, { status: 500 });
  }

  return NextResponse.json({ stage: data });
}
