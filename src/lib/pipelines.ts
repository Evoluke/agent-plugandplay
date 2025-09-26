import { supabaseadmin } from '@/lib/supabaseAdmin'

export async function getCompanyIdForUser(userId: string) {
  return supabaseadmin
    .from('company')
    .select('id')
    .eq('user_id', userId)
    .single()
}

export async function getPipelineForCompany(pipelineId: string, companyId: number) {
  return supabaseadmin
    .from('pipeline')
    .select('id, company_id')
    .eq('id', pipelineId)
    .eq('company_id', companyId)
    .single()
}

export async function getStagesForPipeline(stageIds: string[], pipelineId: string, companyId: number) {
  if (stageIds.length === 0) {
    return { data: [], error: null }
  }
  return supabaseadmin
    .from('stage')
    .select('id, pipeline_id, company_id')
    .in('id', stageIds)
    .eq('pipeline_id', pipelineId)
    .eq('company_id', companyId)
}
