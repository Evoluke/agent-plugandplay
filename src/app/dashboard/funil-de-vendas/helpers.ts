import {
  CardFormState,
  DEFAULT_STAGE_COLOR,
  PipelineFormState,
  PipelineStageForm,
} from './types'

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

export const normalizeStageColor = (value: string | null | undefined): string => {
  if (typeof value !== 'string') {
    return DEFAULT_STAGE_COLOR
  }

  return HEX_COLOR_REGEX.test(value) ? value.toUpperCase() : DEFAULT_STAGE_COLOR
}

export const isValidStageColor = (value: string | null | undefined): boolean =>
  typeof value === 'string' && HEX_COLOR_REGEX.test(value)

export const createEmptyStage = (position: number): PipelineStageForm => ({
  name: '',
  position,
  color: normalizeStageColor(DEFAULT_STAGE_COLOR),
})

export const reindexStages = (stages: PipelineStageForm[]): PipelineStageForm[] =>
  stages.map((stage, index) => ({ ...stage, position: index }))

export const createInitialPipelineForm = (): PipelineFormState => ({
  name: '',
  description: '',
  stages: [createEmptyStage(0)],
  removedStageIds: [],
})

export const createInitialCardForm = (): CardFormState => ({
  contact: '',
})
