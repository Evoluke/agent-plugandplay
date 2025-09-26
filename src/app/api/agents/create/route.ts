export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { POST as triggerPaymentRequest } from "@/app/api/payments/pay/route";
import { AGENT_TEMPLATES } from "@/lib/agentTemplates";
import { getUserFromCookie } from "@/lib/auth";
import {
  ALLOWED_AGENT_TYPES,
  AGENT_PRICE,
  MAX_AGENTS_PER_COMPANY,
} from "@/lib/constants";
import { supabaseadmin } from "@/lib/supabaseAdmin";
import { isValidAgentName } from "@/lib/validators";

function errorResponse(
  message: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

async function getUserFromRequest(request?: Request) {
  const authHeader = request?.headers.get("Authorization") ?? "";
  const bearerPrefix = "Bearer ";

  if (authHeader.startsWith(bearerPrefix)) {
    const token = authHeader.slice(bearerPrefix.length).trim();

    if (token) {
      const { data, error } = await supabaseadmin.auth.getUser(token);

      if (!error && data.user) {
        return { user: data.user, accessToken: token, error };
      }

      if (error) {
        console.error("[agents:create] Erro ao validar token de autorização", error);
      }
    }
  }

  return getUserFromCookie();
}

async function rebuildAgentInstructions(agentId: string) {
  const [agentRes, personalityRes, behaviorRes, onboardingRes, specificRes] =
    await Promise.all([
      supabaseadmin
        .from("agents")
        .select("name, type")
        .eq("id", agentId)
        .single(),
      supabaseadmin
        .from("agent_personality")
        .select("voice_tone, objective, limits, company_name, company_segment")
        .eq("agent_id", agentId)
        .single(),
      supabaseadmin
        .from("agent_behavior")
        .select("limitations, default_fallback")
        .eq("agent_id", agentId)
        .single(),
      supabaseadmin
        .from("agent_onboarding")
        .select("welcome_message, pain_points, collection")
        .eq("agent_id", agentId)
        .single(),
      supabaseadmin
        .from("agent_specific_instructions")
        .select("context, user_says, action")
        .eq("agent_id", agentId),
    ]);

  const instructions: Record<string, unknown> = {};

  if (agentRes.data) Object.assign(instructions, agentRes.data);
  if (personalityRes.data) Object.assign(instructions, personalityRes.data);
  if (behaviorRes.data) Object.assign(instructions, behaviorRes.data);
  if (onboardingRes.data) Object.assign(instructions, onboardingRes.data);

  const collectionArray = Array.isArray(onboardingRes.data?.collection)
    ? (onboardingRes.data?.collection as { question: string }[])
    : [];

  const collectionString = collectionArray
    .map(
      (item: { question: string }, index: number) =>
        `${index + 2}. Se [var_${index}] não estiver preenchido, pergunte: "${item.question}"`
    )
    .join("\n");

  const collectionVarString = collectionArray
    .map((item: { question: string }, index: number) =>
      `[var_${index}] - ${item.question}`
    )
    .join("\n");

  instructions.collection = collectionString;
  instructions.collection_var = collectionVarString;

  const specificInstructionsString =
    specificRes.data
      ?.map(
        (item: { context?: string; user_says?: string; action?: string }) =>
          `Context: "${item.context ?? ""}"\n` +
          `User says: "${item.user_says ?? ""}"\n` +
          `Act like this: "${item.action ?? ""}"`
      )
      .join("\n\n") ?? "";

  instructions.specific_instructions = specificInstructionsString;

  if (personalityRes.data?.company_name) {
    instructions.name = personalityRes.data.company_name;
  }

  const { error: updateError } = await supabaseadmin
    .from("agents")
    .update({ instructions })
    .eq("id", agentId);

  if (updateError) {
    throw updateError;
  }
}

async function applyTemplate(agentId: string, type: string) {
  const template = AGENT_TEMPLATES[type];

  if (template) {
    const behavior =
      template.behavior ?? {
        limitations: "",
        default_fallback: "",
      };

    const insertOperations = [
      supabaseadmin.from("agent_personality").insert({
        agent_id: agentId,
        ...template.personality,
      }),
      supabaseadmin.from("agent_behavior").insert({
        agent_id: agentId,
        ...behavior,
      }),
      supabaseadmin.from("agent_onboarding").insert({
        agent_id: agentId,
        ...template.onboarding,
      }),
    ];

    if (template.specificInstructions.length > 0) {
      insertOperations.push(
        supabaseadmin
          .from("agent_specific_instructions")
          .insert(
            template.specificInstructions.map((item) => ({
              agent_id: agentId,
              ...item,
            }))
          )
      );
    }

    const insertResults = await Promise.all(insertOperations);
    const firstError = insertResults.find((result) => result.error)?.error;

    if (firstError) {
      throw firstError;
    }
  }

  await rebuildAgentInstructions(agentId);
}

async function cleanupAgent(agentId: string) {
  await Promise.allSettled([
    supabaseadmin
      .from("agent_specific_instructions")
      .delete()
      .eq("agent_id", agentId),
    supabaseadmin.from("agent_onboarding").delete().eq("agent_id", agentId),
    supabaseadmin.from("agent_behavior").delete().eq("agent_id", agentId),
    supabaseadmin
      .from("agent_personality")
      .delete()
      .eq("agent_id", agentId),
  ]);

  await supabaseadmin.from("agents").delete().eq("id", agentId);
}

async function triggerCreateBox(
  agentId: string,
  agentName: string,
  chatwootId: string | number,
  chatwootUserId: string | number
) {
  const baseUrl = process.env.N8N_AGENT_WEBHOOK_URL;
  const token = process.env.N8N_WEBHOOK_TOKEN;

  if (!baseUrl || !token) {
    throw new Error("N8N create-box webhook não configurado");
  }

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    },
    body: JSON.stringify({
      agent_id: agentId,
      agent_internal_name: agentName,
      chatwoot_id: chatwootId,
      chatwoot_user_id: chatwootUserId,
    }),
  });

  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof (data as { error?: unknown })?.error === "string"
        ? (data as { error: string }).error
        : "Falha ao criar caixa do Chatwoot.";

    throw new Error(message);
  }

  return data;
}

async function triggerPayment(
  accessToken: string | null,
  payment: { id: string; amount: number | string; due_date: string }
) {
  if (!accessToken) return null;

  const amountNumber =
    typeof payment.amount === "number"
      ? payment.amount
      : Number(payment.amount);

  if (!Number.isFinite(amountNumber) || !payment.due_date) {
    return null;
  }

  try {
    const request = new Request("http://localhost/api/payments/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        id: payment.id,
        date: payment.due_date.slice(0, 10),
        total: amountNumber,
      }),
    });

    const response = await triggerPaymentRequest(request);
    let responseData: unknown = null;

    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }

    if (!response.ok) {
      console.error("[agents:create] Falha ao acionar pagamento", responseData);
      return null;
    }

    return responseData;
  } catch (error) {
    console.error("[agents:create] Erro ao acionar pagamento", error);
    return null;
  }
}

export async function GET(request: Request) {
  const { user } = await getUserFromRequest(request);

  if (!user) {
    return errorResponse("Não autenticado", 401);
  }

  const { data: company, error: companyError } = await supabaseadmin
    .from("company")
    .select("id, chatwoot_id, chatwoot_user_id")
    .eq("user_id", user.id)
    .single();

  if (companyError || !company) {
    return errorResponse("Empresa não encontrada.", 404);
  }

  const { count, error: countError } = await supabaseadmin
    .from("agents")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id);

  if (countError) {
    console.error("[agents:create] Erro ao contar agentes", countError);
    return errorResponse(
      "Não foi possível carregar informações dos agentes.",
      500
    );
  }

  const agentCount = count ?? 0;

  return NextResponse.json({
    agentCount,
    maxAgents: MAX_AGENTS_PER_COMPANY,
    limitReached: agentCount >= MAX_AGENTS_PER_COMPANY,
  });
}

export async function POST(request: Request) {
  const { user, accessToken } = await getUserFromRequest(request);

  if (!user) {
    return errorResponse("Não autenticado", 401);
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return errorResponse("Corpo da requisição inválido.", 400);
  }

  if (!payload || typeof payload !== "object") {
    return errorResponse("Corpo da requisição inválido.", 400);
  }

  const { name, type } = payload as {
    name?: unknown;
    type?: unknown;
  };

  if (typeof name !== "string" || !isValidAgentName(name)) {
    return errorResponse(
      "O nome do agente deve ter entre 3 e 50 caracteres.",
      400
    );
  }

  if (typeof type !== "string" || !ALLOWED_AGENT_TYPES.includes(type)) {
    return errorResponse("Tipo de agente inválido.", 400);
  }

  const trimmedName = name.trim();

  type CompanyRecord = {
    id: string;
    chatwoot_id: string | number | null;
    chatwoot_user_id: string | number | null;
    subscription_expires_at: string | null;
  };

  const { data: company, error: companyError } = await supabaseadmin
    .from("company")
    .select("id, chatwoot_id, chatwoot_user_id, subscription_expires_at")
    .eq("user_id", user.id)
    .single<CompanyRecord>();

  if (companyError || !company) {
    return errorResponse("Empresa não encontrada.", 404);
  }

  const { count, error: countError } = await supabaseadmin
    .from("agents")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id);

  if (countError) {
    console.error("[agents:create] Erro ao contar agentes", countError);
    return errorResponse(
      "Não foi possível verificar o limite de agentes.",
      500
    );
  }

  const existingAgents = count ?? 0;

  if (existingAgents >= MAX_AGENTS_PER_COMPANY) {
    return errorResponse(
      `Limite de ${MAX_AGENTS_PER_COMPANY} agentes atingido.`,
      400,
      { limitReached: true, agentCount: existingAgents }
    );
  }

  const { data: agentData, error: agentError } = await supabaseadmin
    .from("agents")
    .insert({
      name: trimmedName,
      type,
      company_id: company.id,
    })
    .select("id")
    .single();

  if (agentError || !agentData) {
    console.error("[agents:create] Erro ao criar agente", agentError);
    return errorResponse("Erro ao criar agente.", 500);
  }

  const agentId = agentData.id as string;

  try {
    await applyTemplate(agentId, type);
  } catch (error) {
    console.error("[agents:create] Erro ao aplicar template", error);
    await cleanupAgent(agentId);
    return errorResponse("Erro ao aplicar template do agente.", 500);
  }

  if (!company.chatwoot_id || !company.chatwoot_user_id) {
    await cleanupAgent(agentId);
    return errorResponse(
      "Integração do Chatwoot não configurada para esta empresa.",
      409
    );
  }

  try {
    await triggerCreateBox(
      agentId,
      trimmedName,
      company.chatwoot_id,
      company.chatwoot_user_id
    );
  } catch (error) {
    console.error("[agents:create] Erro ao chamar create-box no N8N", error);
    await cleanupAgent(agentId);
    return errorResponse(
      "Não foi possível provisionar a caixa do Chatwoot para o agente.",
      502
    );
  }

  let paymentInfo: Record<string, unknown> | null = null;
  let subscriptionExpiresAt = company.subscription_expires_at ?? null;

  const { data: existingPayment, error: existingPaymentError } =
    await supabaseadmin
      .from("payments")
      .select("id")
      .eq("company_id", company.id)
      .limit(1)
      .maybeSingle();

  if (existingPaymentError) {
    console.error(
      "[agents:create] Erro ao verificar pagamentos existentes",
      existingPaymentError
    );
  }

  if (!existingPayment) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateIso = dueDate.toISOString();

    const {
      data: paymentData,
      error: paymentError,
    } = await supabaseadmin
      .from("payments")
      .insert({
        company_id: company.id,
        amount: AGENT_PRICE,
        due_date: dueDateIso,
        reference: "Mensalidade Agent Plug and Play",
      })
      .select("id, amount, due_date")
      .single();

    if (paymentError) {
      console.error("[agents:create] Erro ao criar pagamento", paymentError);
    }

    if (paymentData) {
      const asaasResponse = await triggerPayment(accessToken ?? null, {
        id: paymentData.id as string,
        amount: paymentData.amount as number | string,
        due_date: paymentData.due_date as string,
      });

      const newExpiration = paymentData.due_date as string | null;

      if (newExpiration) {
        const newExpirationDate = new Date(newExpiration);
        const currentExpirationDate = subscriptionExpiresAt
          ? new Date(subscriptionExpiresAt)
          : null;

        if (
          !currentExpirationDate ||
          newExpirationDate.getTime() > currentExpirationDate.getTime()
        ) {
          const { error: companyUpdateError } = await supabaseadmin
            .from("company")
            .update({ subscription_expires_at: newExpiration })
            .eq("id", company.id);

          if (companyUpdateError) {
            console.error(
              "[agents:create] Erro ao atualizar expiração corporativa",
              companyUpdateError
            );
          } else {
            subscriptionExpiresAt = newExpiration;
          }
        }
      }

      paymentInfo = {
        ...paymentData,
        ...(asaasResponse ? { asaas: asaasResponse } : {}),
      };
    }
  }

  const updatedCount = existingAgents + 1;
  const limitReached = updatedCount >= MAX_AGENTS_PER_COMPANY;

  return NextResponse.json(
    {
      id: agentId,
      message: "Agente criado com sucesso.",
      agentCount: updatedCount,
      maxAgents: MAX_AGENTS_PER_COMPANY,
      limitReached,
      payment: paymentInfo,
      subscriptionExpiresAt,
    },
    { status: 201 }
  );
}
