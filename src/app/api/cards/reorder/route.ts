export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { getCompanyIdByUser } from "@/lib/company";
import { supabaseadmin } from "@/lib/supabaseAdmin";

type StageOrder = {
  stageId: string;
  cardIds: string[];
};

export async function PATCH(request: NextRequest) {
  const { user, error } = await getUserFromCookie();
  if (error || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const companyResult = await getCompanyIdByUser(user.id);
  if ("error" in companyResult) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const pipelineId = typeof body?.pipelineId === "string" ? body.pipelineId : "";
  const stageOrders: StageOrder[] = Array.isArray(body?.stageOrders)
    ? body.stageOrders.filter(
        (order: StageOrder) => typeof order?.stageId === "string" && Array.isArray(order?.cardIds)
      )
    : [];

  if (!pipelineId || stageOrders.length === 0) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { data: pipeline, error: pipelineError } = await supabaseadmin
    .from("pipeline")
    .select("id")
    .eq("id", pipelineId)
    .eq("company_id", companyResult.companyId)
    .single();

  if (pipelineError || !pipeline) {
    return NextResponse.json({ error: "Funil não encontrado" }, { status: 404 });
  }

  const stageIds = stageOrders.map((order) => order.stageId);
  const { data: stages, error: stagesError } = await supabaseadmin
    .from("stage")
    .select("id, pipeline_id")
    .in("id", stageIds);

  if (stagesError || !stages) {
    return NextResponse.json({ error: "Erro ao validar estágios" }, { status: 500 });
  }

  const isValid = stages.every((stage) => stage.pipeline_id === pipeline.id);
  if (!isValid) {
    return NextResponse.json({ error: "Estágios inválidos" }, { status: 400 });
  }

  const cardIds = stageOrders.flatMap((order) => order.cardIds);

  if (cardIds.length === 0) {
    return NextResponse.json({ success: true });
  }

  const { data: cards, error: cardsError } = await supabaseadmin
    .from("card")
    .select("id, stage:stage_id(pipeline_id)")
    .in("id", cardIds);

  if (cardsError || !cards) {
    return NextResponse.json({ error: "Erro ao validar cartões" }, { status: 500 });
  }

  const uniqueCardIds = new Set(cardIds);
  if (cards.length !== uniqueCardIds.size) {
    return NextResponse.json({ error: "Cartões inválidos" }, { status: 400 });
  }

  const hasInvalidCard = cards.some((card) => card.stage?.pipeline_id !== pipeline.id);
  if (hasInvalidCard) {
    return NextResponse.json({ error: "Cartões inválidos" }, { status: 400 });
  }

  const updates = stageOrders.flatMap((order) =>
    order.cardIds.map((cardId, index) => ({
      id: cardId,
      stage_id: order.stageId,
      position: index,
      updated_at: new Date().toISOString(),
    }))
  );

  const { error: updateError } = await supabaseadmin
    .from("card")
    .upsert(updates, { onConflict: "id" });

  if (updateError) {
    return NextResponse.json({ error: "Não foi possível atualizar a ordenação" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
