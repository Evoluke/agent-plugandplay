import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookie } from '@/lib/auth'
import { getCompanyIdForUser, getPipelineForCompany, getStagesForPipeline } from '@/lib/pipelines'
import { supabaseadmin } from '@/lib/supabaseAdmin'

type Params = { params: { pipelineId: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const { pipelineId } = params
  const { user, error } = await getUserFromCookie()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: company, error: companyError } = await getCompanyIdForUser(user.id)
  if (companyError || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const { data: pipeline, error: pipelineError } = await getPipelineForCompany(pipelineId, company.id)
  if (pipelineError || !pipeline) {
    return NextResponse.json({ error: 'Funil não encontrado.' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const stageId: string | undefined = body?.stageId
  const title: string | undefined = body?.title?.trim?.()

  if (!stageId || !title) {
    return NextResponse.json({ error: 'Estágio e título são obrigatórios.' }, { status: 400 })
  }

  const { data: stages } = await getStagesForPipeline([stageId], pipeline.id, company.id)
  const stage = stages?.[0]
  if (!stage) {
    return NextResponse.json({ error: 'Estágio inválido.' }, { status: 400 })
  }

  const { data: lastCard } = await supabaseadmin
    .from('card')
    .select('position')
    .eq('stage_id', stage.id)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const position = typeof lastCard?.position === 'number' ? lastCard.position + 1 : 0
  const now = new Date().toISOString()

  const { data, error: insertError } = await supabaseadmin
    .from('card')
    .insert({
      stage_id: stage.id,
      company_id: company.id,
      title,
      company_name: body?.companyName?.trim?.() || null,
      owner: body?.owner?.trim?.() || null,
      plan: body?.plan?.trim?.() || null,
      status: body?.status?.trim?.() || 'Ativo',
      estimated_value: typeof body?.estimatedValue === 'number' ? body.estimatedValue : null,
      messages_count: typeof body?.messagesCount === 'number' ? body.messagesCount : 0,
      last_interaction_at: body?.lastInteractionAt || null,
      next_action_at: body?.nextActionAt || null,
      note: body?.note?.trim?.() || null,
      position,
      created_at: now,
      updated_at: now,
    })
    .select(
      'id, title, company_name, owner, plan, status, estimated_value, messages_count, last_interaction_at, next_action_at, note, position, created_at, updated_at, stage_id'
    )
    .single()

  if (insertError || !data) {
    return NextResponse.json({ error: insertError?.message ?? 'Erro ao criar oportunidade' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { pipelineId } = params
  const { user, error } = await getUserFromCookie()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: company, error: companyError } = await getCompanyIdForUser(user.id)
  if (companyError || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const { data: pipeline, error: pipelineError } = await getPipelineForCompany(pipelineId, company.id)
  if (pipelineError || !pipeline) {
    return NextResponse.json({ error: 'Funil não encontrado.' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const cardId: string | undefined = body?.cardId
  const sourceStageId: string | undefined = body?.sourceStageId
  const destinationStageId: string | undefined = body?.destinationStageId
  const destinationIndex: number | undefined = typeof body?.destinationIndex === 'number' ? body.destinationIndex : undefined

  if (!cardId || !sourceStageId || !destinationStageId || typeof destinationIndex !== 'number') {
    return NextResponse.json({ error: 'Dados insuficientes para reordenar.' }, { status: 400 })
  }

  const stageIds = sourceStageId === destinationStageId ? [sourceStageId] : [sourceStageId, destinationStageId]
  const { data: stages, error: stagesError } = await getStagesForPipeline(stageIds, pipeline.id, company.id)
  if (stagesError) {
    return NextResponse.json({ error: stagesError.message }, { status: 500 })
  }

  if (!stages || stages.length !== stageIds.length) {
    return NextResponse.json({ error: 'Estágios inválidos para este funil.' }, { status: 400 })
  }

  const { data: card, error: cardError } = await supabaseadmin
    .from('card')
    .select('id, stage_id, company_id')
    .eq('id', cardId)
    .eq('company_id', company.id)
    .single()

  if (cardError || !card) {
    return NextResponse.json({ error: 'Oportunidade não encontrada.' }, { status: 404 })
  }

  if (card.stage_id !== sourceStageId) {
    return NextResponse.json({ error: 'Oportunidade fora do estágio informado.' }, { status: 400 })
  }

  const { data: cardsData, error: cardsError } = await supabaseadmin
    .from('card')
    .select('id, stage_id')
    .in('stage_id', stageIds)
    .eq('company_id', company.id)
    .order('position', { ascending: true })

  if (cardsError) {
    return NextResponse.json({ error: cardsError.message }, { status: 500 })
  }

  const map = new Map<string, { id: string; stage_id: string }[]>()
  for (const stageId of stageIds) {
    map.set(stageId, [])
  }
  for (const item of cardsData ?? []) {
    const list = map.get(item.stage_id)
    if (list) list.push(item)
  }

  const sourceList = map.get(sourceStageId) ?? []
  const destinationList = map.get(destinationStageId) ?? []

  const currentIndex = sourceList.findIndex((item) => item.id === cardId)
  if (currentIndex === -1) {
    return NextResponse.json({ error: 'A ordem atual do estágio está desatualizada.' }, { status: 409 })
  }

  const [moved] = sourceList.splice(currentIndex, 1)
  moved.stage_id = destinationStageId

  const targetIndex = Math.max(0, Math.min(destinationIndex, destinationList.length))
  destinationList.splice(targetIndex, 0, moved)

  const now = new Date().toISOString()
  const updates: { id: string; stage_id: string; position: number; updated_at: string }[] = []

  sourceList.forEach((item, index) => {
    updates.push({ id: item.id, stage_id: sourceStageId, position: index, updated_at: now })
  })
  destinationList.forEach((item, index) => {
    updates.push({ id: item.id, stage_id: destinationStageId, position: index, updated_at: now })
  })

  const { error: updateError } = await supabaseadmin.from('card').upsert(updates, { onConflict: 'id' })
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
