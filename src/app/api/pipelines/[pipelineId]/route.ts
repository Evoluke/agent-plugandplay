import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookie } from '@/lib/auth'
import { getCompanyIdForUser, getPipelineForCompany } from '@/lib/pipelines'
import { supabaseadmin } from '@/lib/supabaseAdmin'

type Params = { params: { pipelineId: string } }

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
  const name: string | undefined = body?.name?.trim?.()
  const description: string | undefined = body?.description?.trim?.()

  if (!name && typeof description === 'undefined') {
    return NextResponse.json({ error: 'Nenhuma alteração enviada.' }, { status: 400 })
  }

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (name) payload.name = name
  if (typeof description !== 'undefined') {
    payload.description = description || null
  }

  const { data: updated, error: updateError } = await supabaseadmin
    .from('pipeline')
    .update(payload)
    .eq('id', pipeline.id)
    .select('id, name, description, created_at, updated_at')
    .single()

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message ?? 'Erro ao atualizar funil' }, { status: 500 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
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

  const { error: deleteError } = await supabaseadmin.from('pipeline').delete().eq('id', pipeline.id)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
