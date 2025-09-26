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
  const name: string = body?.name?.trim()
  if (!name) {
    return NextResponse.json({ error: 'O nome do estágio é obrigatório.' }, { status: 400 })
  }

  const { data: lastStage } = await supabaseadmin
    .from('stage')
    .select('position')
    .eq('pipeline_id', pipeline.id)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const position = typeof lastStage?.position === 'number' ? lastStage.position + 1 : 0
  const now = new Date().toISOString()

  const { data, error: insertError } = await supabaseadmin
    .from('stage')
    .insert({
      name,
      pipeline_id: pipeline.id,
      company_id: company.id,
      position,
      created_at: now,
      updated_at: now,
    })
    .select('id, name, position, created_at, updated_at')
    .single()

  if (insertError || !data) {
    return NextResponse.json({ error: insertError?.message ?? 'Erro ao criar estágio' }, { status: 500 })
  }

  return NextResponse.json({ ...data, cards: [] })
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
  const order: string[] | undefined = Array.isArray(body?.order) ? body.order : undefined
  if (!order || order.length === 0) {
    return NextResponse.json({ error: 'Envie a nova ordem dos estágios.' }, { status: 400 })
  }

  const { data: stages, error: stagesError } = await getStagesForPipeline(order, pipeline.id, company.id)
  if (stagesError) {
    return NextResponse.json({ error: stagesError.message }, { status: 500 })
  }

  if (!stages || stages.length !== order.length) {
    return NextResponse.json({ error: 'Alguns estágios não pertencem a este funil.' }, { status: 400 })
  }

  const updates = order.map((stageId, index) => ({
    id: stageId,
    position: index,
    updated_at: new Date().toISOString(),
  }))

  const { error: updateError } = await supabaseadmin.from('stage').upsert(updates, { onConflict: 'id' })
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
