export type QualificationTransferRule = 'never' | 'user_request' | 'lead_interested';

export const QUALIFICATION_TRANSFER_RULES: { value: QualificationTransferRule; label: string }[] = [
  { value: 'never', label: 'Nunca transferir automaticamente' },
  { value: 'user_request', label: 'Quando o usuário solicitar' },
  { value: 'lead_interested', label: 'Quando o lead demonstrar interesse' },
];

export const QUALIFICATION_TRANSFER_RULE_TEXT: Record<QualificationTransferRule, string> = {
  never: 'Nunca transferir automaticamente',
  user_request: 'Transferir para humano se o usuário solicitar atendimento.',
  lead_interested: 'Transferir para humano quando o lead demonstrar interesse claro em prosseguir.',
};
