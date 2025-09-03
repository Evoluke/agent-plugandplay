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
        .select("voice_tone, objective, limits, company_name, company_segment")
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

  const collectionArray = onboardingRes.data?.collection ?? [];
  const collectionString = collectionArray
    .map(
      (item: { question: string }, index: number) =>
        `${index + 2}. Se [var_${index}] não estiver preenchido, pergunte: "${item.question}"`
    )
    .join("\n");

  const specificInstructionsString =
    specificRes.data
      ?.map(
        (item: { context?: string; user_says?: string; action?: string }) =>
          `Context: "${item.context ?? ""}"\n` +
          `User says: "${item.user_says ?? ""}"\n` +
          `Act like this: "${item.action ?? ""}"`
      )
      .join("\n\n") ?? "";

  const collectionArray_var = onboardingRes.data?.collection ?? [];
  const collectionString_var = collectionArray_var
    .map((item: { question: string }, index: number) =>
      `[var_${index}] - ${item.question}`
    )
    .join("\n");

  const instructions = {
    ...(agentRes.data ?? {}),
    ...(personalityRes.data ?? {}),
    ...(behaviorRes.data ?? {}),
    ...(onboardingRes.data ?? {}),
    collection: collectionString,
    collection_var: collectionString_var,
    specific_instructions: specificInstructionsString,
  } as Record<string, unknown>;

  if (personalityRes.data?.company_name) {
    instructions.name = personalityRes.data.company_name;
  }

  await supabasebrowser
    .from("agents")
    .update({ instructions })
    .eq("id", agentId);
}
