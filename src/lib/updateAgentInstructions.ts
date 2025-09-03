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
        .select("voice_tone, objective, limits, company_name")
        .eq("agent_id", agentId)
        .single(),
      supabasebrowser
        .from("agent_behavior")
        .select("limitations, default_fallback")
        .eq("agent_id", agentId)
        .single(),
      supabasebrowser
        .from("agent_onboarding")
        .select("welcome_message, pain_points, collection")
        .eq("agent_id", agentId)
        .single(),
      supabasebrowser
        .from("agent_specific_instructions")
        .select("context, user_says, action")
        .eq("agent_id", agentId),
    ]);

  const onboarding = onboardingRes.data ?? {};
  const collection = Array.isArray(onboarding.collection)
    ? onboarding.collection
        .map(
          (item: { question: string; information: string }, index: number) =>
            `${index + 2}. Se [${item.information}] não estiver preenchido, pergunte: "${item.question}"`
        )
        .join("\n")
    : "";

  const instructions = {
    ...(agentRes.data ?? {}),
    ...(personalityRes.data ?? {}),
    ...(behaviorRes.data ?? {}),
    welcome_message: onboarding.welcome_message,
    pain_points: onboarding.pain_points,
    collection,
    specific_instructions: specificRes.data ?? [],
  } as Record<string, unknown>;

  await supabasebrowser
    .from("agents")
    .update({ instructions })
    .eq("id", agentId);
}
