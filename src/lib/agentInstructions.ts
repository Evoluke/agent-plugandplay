export interface AgentInstructionsData {
  personality: {
    voice_tone: string;
    objective: string;
    limits: string;
  };
  behavior: {
    limitations: string;
    forbidden_words: string;
    default_fallback: string;
    qualification_transfer_rule: string;
  };
  onboarding: {
    welcome_message: string;
    collection: { question: string; information: string }[];
  };
  specificInstructions: { context: string; user_says: string; action: string }[];
}

export function buildAgentInstructions(data: AgentInstructionsData): string {
  const lines: string[] = [];
  lines.push('<agent>');
  lines.push('  <personality>');
  lines.push(`    <voice_tone>${data.personality.voice_tone}</voice_tone>`);
  lines.push(`    <objective>${data.personality.objective}</objective>`);
  lines.push(`    <limits>${data.personality.limits}</limits>`);
  lines.push('  </personality>');
  lines.push('  <behavior>');
  lines.push(`    <limitations>${data.behavior.limitations}</limitations>`);
  lines.push(`    <forbidden_words>${data.behavior.forbidden_words}</forbidden_words>`);
  lines.push(`    <default_fallback>${data.behavior.default_fallback}</default_fallback>`);
  lines.push(
    `    <qualification_transfer_rule>${data.behavior.qualification_transfer_rule}</qualification_transfer_rule>`,
  );
  lines.push('  </behavior>');
  lines.push('  <onboarding>');
  lines.push(`    <welcome_message>${data.onboarding.welcome_message}</welcome_message>`);
  lines.push('    <collection>');
  for (const item of data.onboarding.collection) {
    lines.push(
      `      <item question="${item.question}" information="${item.information}" />`,
    );
  }
  lines.push('    </collection>');
  lines.push('  </onboarding>');
  lines.push('  <specific_instructions>');
  for (const inst of data.specificInstructions) {
    lines.push('    <instruction>');
    lines.push(`      <context>${inst.context}</context>`);
    lines.push(`      <user_says>${inst.user_says}</user_says>`);
    lines.push(`      <action>${inst.action}</action>`);
    lines.push('    </instruction>');
  }
  lines.push('  </specific_instructions>');
  lines.push('</agent>');
  return lines.join('\n');
}
