export const MAX_PIPELINES_PER_COMPANY = 5
export const MAX_STAGES_PER_PIPELINE = 10

export const PIPELINE_NAME_MAX_LENGTH = 60
export const PIPELINE_DESCRIPTION_MAX_LENGTH = 240
export const STAGE_NAME_MAX_LENGTH = 40

export const STAGE_COLOR_REGEX = /^#(?:[0-9a-fA-F]{6})$/

export const STAGE_COLOR_PALETTE = [
  '#0EA5E9',
  '#6366F1',
  '#22C55E',
  '#F59E0B',
  '#EC4899',
  '#14B8A6',
  '#8B5CF6',
  '#F97316',
  '#EF4444',
  '#A855F7',
]

export const DEFAULT_STAGE_CONFIG = [
  { name: 'Entrada', color: '#0EA5E9' },
  { name: 'Atendimento Humano', color: '#6366F1' },
  { name: 'Qualificado', color: '#22C55E' },
]

export const CARD_TITLE_MAX_LENGTH = 120
export const CARD_COMPANY_MAX_LENGTH = 80
export const CARD_OWNER_MAX_LENGTH = 80
export const CARD_STATUS_MAX_LENGTH = 60
export const CARD_TAG_MAX_LENGTH = 40
