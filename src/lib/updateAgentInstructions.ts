import { supabasebrowser } from "./supabaseClient";

export async function updateAgentInstructions(agentId: string) {
  const [agentRes, personalityRes, behaviorRes, onboardingRes, specificRes] =
    await Promise.all([
      supabasebrowser
        .from("agents")
        .select("name, type")
        .eq("id", agentId)
        .single(),
      supabasebrowser
        .from("agent_personality")
        .select("voice_tone, objective, limits")
        .eq("agent_id", agentId)
        .single(),
      supabasebrowser
        .from("agent_behavior")
        .select(
          "limitations, forbidden_words, default_fallback, qualification_transfer_rule, qualification_transfer_conditions"
        )
        .eq("agent_id", agentId)
        .single(),
      supabasebrowser
        .from("agent_onboarding")
        .select("welcome_message, collection")
        .eq("agent_id", agentId)
        .single(),
      supabasebrowser
        .from("agent_specific_instructions")
        .select("context, user_says, action")
        .eq("agent_id", agentId),
    ]);

  const instructions = {
    ...(agentRes.data ?? {}),
    ...(personalityRes.data ?? {}),
    ...(behaviorRes.data ?? {}),
    ...(onboardingRes.data ?? {}),
    specific_instructions: specificRes.data ?? [],
  } as Record<string, unknown>;

  await supabasebrowser
    .from("agents")
    .update({ instructions })
    .eq("id", agentId);
}
