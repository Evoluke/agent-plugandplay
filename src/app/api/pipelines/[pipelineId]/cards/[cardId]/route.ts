import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookie } from '@/lib/auth'
import { getCompanyIdForUser, getPipelineForCompany } from '@/lib/pipelines'
import { supabaseadmin } from '@/lib/supabaseAdmin'

type Params = { params: { pipelineId: string; cardId: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { pipelineId, cardId } = params
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
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Nenhuma alteração enviada.' }, { status: 400 })
  }

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.title) payload.title = String(body.title).trim()
  if ('companyName' in body) payload.company_name = body.companyName?.trim?.() || null
  if ('owner' in body) payload.owner = body.owner?.trim?.() || null
  if ('plan' in body) payload.plan = body.plan?.trim?.() || null
  if ('status' in body) payload.status = body.status?.trim?.() || null
  if ('estimatedValue' in body) {
    payload.estimated_value = typeof body.estimatedValue === 'number' ? body.estimatedValue : null
  }
  if ('messagesCount' in body) {
    payload.messages_count = typeof body.messagesCount === 'number' ? body.messagesCount : 0
  }
  if ('lastInteractionAt' in body) payload.last_interaction_at = body.lastInteractionAt || null
  if ('nextActionAt' in body) payload.next_action_at = body.nextActionAt || null
  if ('note' in body) payload.note = body.note?.trim?.() || null

  if (Object.keys(payload).length === 1) {
    return NextResponse.json({ error: 'Nenhuma alteração válida enviada.' }, { status: 400 })
  }

  const { data: updated, error: updateError } = await supabaseadmin
    .from('card')
    .update(payload)
    .eq('id', cardId)
    .eq('company_id', company.id)
    .select(
      'id, title, company_name, owner, plan, status, estimated_value, messages_count, last_interaction_at, next_action_at, note, position, created_at, updated_at, stage_id'
    )
    .maybeSingle()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (!updated) {
    return NextResponse.json({ error: 'Oportunidade não encontrada.' }, { status: 404 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { pipelineId, cardId } = params
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

  const { error: deleteError } = await supabaseadmin
    .from('card')
    .delete()
    .eq('id', cardId)
    .eq('company_id', company.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
