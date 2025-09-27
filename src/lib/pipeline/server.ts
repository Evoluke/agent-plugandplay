import { supabaseadmin } from '@/lib/supabaseAdmin'
import {
  DEFAULT_PIPELINE_IDENTIFIER,
  DEFAULT_PIPELINE_NAME,
  DEFAULT_STAGE_PRESETS,
} from './defaults'

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/
const DEFAULT_STAGE_COLOR = '#F8FAFC'

const normalizeStageColor = (value: string | null | undefined): string => {
  if (typeof value !== 'string') {
    return DEFAULT_STAGE_COLOR
  }

  return HEX_COLOR_REGEX.test(value) ? value.toUpperCase() : DEFAULT_STAGE_COLOR
}

export const ensureDefaultPipelineForCompany = async (
  companyId: number
): Promise<string> => {
  const { data: existingDefault, error: existingDefaultError } = await supabaseadmin
    .from('pipeline')
    .select('id')
    .eq('company_id', companyId)
    .eq('identifier', DEFAULT_PIPELINE_IDENTIFIER)
    .maybeSingle()

  if (existingDefaultError) {
    throw existingDefaultError
  }

  let pipelineId = existingDefault?.id ?? null

  if (!pipelineId) {
    const { data: legacyDefault, error: legacyDefaultError } = await supabaseadmin
      .from('pipeline')
      .select('id')
      .eq('company_id', companyId)
      .eq('name', DEFAULT_PIPELINE_NAME)
      .maybeSingle()

    if (legacyDefaultError) {
      throw legacyDefaultError
    }

    if (legacyDefault?.id) {
      const { error: attachIdentifierError } = await supabaseadmin
        .from('pipeline')
        .update({ identifier: DEFAULT_PIPELINE_IDENTIFIER, name: DEFAULT_PIPELINE_NAME })
        .eq('id', legacyDefault.id)

      if (attachIdentifierError) {
        throw attachIdentifierError
      }

      pipelineId = legacyDefault.id
    }
  }

  if (!pipelineId) {
    const { data: createdPipeline, error: createPipelineError } = await supabaseadmin
      .from('pipeline')
      .insert({
        company_id: companyId,
        name: DEFAULT_PIPELINE_NAME,
        description: null,
        identifier: DEFAULT_PIPELINE_IDENTIFIER,
      })
      .select('id')
      .single()

    if (createPipelineError) {
      throw createPipelineError
    }

    pipelineId = createdPipeline.id
  }

  const { data: existingStages, error: existingStagesError } = await supabaseadmin
    .from('stage')
    .select('id, name, position, color')
    .eq('pipeline_id', pipelineId)
    .order('position', { ascending: true })

  if (existingStagesError) {
    throw existingStagesError
  }

  const remainingStages = [...(existingStages ?? [])]
  const updates: { id: string; name: string; position: number; color: string }[] = []
  const inserts: { name: string; position: number; pipeline_id: string; color: string }[] = []

  DEFAULT_STAGE_PRESETS.forEach(({ name, color }, index) => {
    const normalizedColor = normalizeStageColor(color)
    const matchIndex = remainingStages.findIndex((stage) => stage.name === name)

    if (matchIndex >= 0) {
      const matchedStage = remainingStages.splice(matchIndex, 1)[0]
      const matchedColor = normalizeStageColor(matchedStage.color)

      if (
        matchedStage.name !== name ||
        matchedStage.position !== index ||
        matchedColor !== normalizedColor
      ) {
        updates.push({
          id: matchedStage.id,
          name,
          position: index,
          color: normalizedColor,
        })
      }
    } else {
      inserts.push({
        name,
        position: index,
        pipeline_id: pipelineId,
        color: normalizedColor,
      })
    }
  })

  for (const stage of updates) {
    const { error: updateError } = await supabaseadmin
      .from('stage')
      .update({ name: stage.name, position: stage.position, color: stage.color })
      .eq('id', stage.id)

    if (updateError) {
      throw updateError
    }
  }

  if (inserts.length) {
    const { error: insertError } = await supabaseadmin.from('stage').insert(inserts)
    if (insertError) {
      throw insertError
    }
  }

  return pipelineId
}
