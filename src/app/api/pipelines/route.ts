import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookie } from '@/lib/auth'
import { getCompanyIdForUser } from '@/lib/pipelines'
import { supabaseadmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const { user, error } = await getUserFromCookie()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: company, error: companyError } = await getCompanyIdForUser(user.id)
  if (companyError || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const { data, error: dbError } = await supabaseadmin
    .from('pipeline')
    .select(
      `id, name, description, created_at, updated_at,
        stages:stage(
          id, name, position, created_at, updated_at,
          cards:card(
            id, stage_id, title, company_name, owner, plan, status,
            estimated_value, messages_count, last_interaction_at,
            next_action_at, note, position, created_at, updated_at
          )
        )`
    )
    .eq('company_id', company.id)
    .order('created_at', { ascending: true })
    .order('position', { referencedTable: 'stage', ascending: true })
    .order('position', { referencedTable: 'stage.card', ascending: true })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const { user, error } = await getUserFromCookie()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: company, error: companyError } = await getCompanyIdForUser(user.id)
  if (companyError || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const name: string = body?.name?.trim()
  const description: string | undefined = body?.description?.trim?.()

  if (!name) {
    return NextResponse.json({ error: 'O nome do funil é obrigatório.' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { data, error: insertError } = await supabaseadmin
    .from('pipeline')
    .insert({
      name,
      description: description || null,
      company_id: company.id,
      created_at: now,
      updated_at: now,
    })
    .select('id, name, description, created_at, updated_at')
    .single()

  if (insertError || !data) {
    return NextResponse.json({ error: insertError?.message ?? 'Erro ao criar funil' }, { status: 500 })
  }

  return NextResponse.json({ ...data, stages: [] })
}
