export type QualificationTransferRule =
  | 'never'
  | 'filled_collection_questions'
  | 'personalized';

export const QUALIFICATION_TRANSFER_RULES: {
  value: QualificationTransferRule;
  label: string;
}[] = [
  { value: 'never', label: 'Nunca transferir automaticamente' },
  {
    value: 'filled_collection_questions',
    label: 'Quando preencher as perguntas de coleta',
  },
  { value: 'personalized', label: 'Personalizado' },
];

export const QUALIFICATION_TRANSFER_RULE_TEXT: Record<
  QualificationTransferRule,
  string
> = {
  never: 'Nunca transferir automaticamente',
  filled_collection_questions:
    'Transferir para humano quando as perguntas de coleta estiverem preenchidas.',
  personalized: 'Transferir para humano conforme condições personalizadas.',
};
