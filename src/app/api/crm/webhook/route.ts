import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  getEvolutionEventType,
  isRecord,
  processEvolutionWebhook,
} from "@/lib/crm/evolutionWebhook";
import { getRedisClient } from "@/lib/redis";
import { supabaseadmin } from "@/lib/supabaseAdmin";

const INCOMING_QUEUE_KEY = "incoming_message";
const JOB_HASH_KEY = `${INCOMING_QUEUE_KEY}:jobs`;
const DEAD_LETTER_HASH_KEY = `${INCOMING_QUEUE_KEY}:deadletter`;

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const apiKey = extractApiKey(req);

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave de API ausente ou inválida." },
        { status: 401 },
      );
    }

    let payload: unknown;

    try {
      payload = await req.json();
    } catch (error) {
      console.error("Evolution webhook - corpo inválido", error);
      return NextResponse.json(
        { error: "Corpo da requisição inválido." },
        { status: 400 },
      );
    }

    if (!isRecord(payload)) {
      return NextResponse.json(
        { error: "O corpo do webhook deve ser um objeto JSON." },
        { status: 400 },
      );
    }

    const { data: instance, error: instanceError } = await supabaseadmin
      .from("instance")
      .select("id, company_id, webhook_secret, is_active, settings")
      .eq("webhook_secret", apiKey)
      .single();

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: "Instância não encontrada para a chave informada." },
        { status: 403 },
      );
    }

    if (!instance.is_active) {
      return NextResponse.json(
        { error: "Instância desativada." },
        { status: 403 },
      );
    }

    const eventType = getEvolutionEventType(payload);

    if (!eventType) {
      return NextResponse.json(
        { error: "Evento da Evolution API não suportado." },
        { status: 400 },
      );
    }

    const companyId = Number(instance.company_id);
    if (Number.isNaN(companyId)) {
      throw new Error("Identificador da empresa inválido.");
    }

    const jobId = randomUUID();
    const receivedAt = new Date().toISOString();

    const jobEnvelope = {
      id: jobId,
      event: eventType,
      receivedAt,
      instanceId: instance.id,
      companyId,
      payload,
    } satisfies Record<string, unknown>;

    const redis = await getRedisClient();

    await redis.hSet(JOB_HASH_KEY, jobId, safeSerialize(jobEnvelope));
    await redis.rPush(INCOMING_QUEUE_KEY, jobId);

    try {
      await processEvolutionWebhook(
        payload,
        {
          instance: {
            id: instance.id,
            companyId,
            settings: (instance.settings as Record<string, unknown> | null) ?? null,
          },
        },
        eventType,
      );

      await redis.hDel(JOB_HASH_KEY, jobId);
      await redis.lRem(INCOMING_QUEUE_KEY, 1, jobId);

      return NextResponse.json({ ok: true });
    } catch (processingError) {
      console.error("Evolution webhook - falha no processamento", processingError);

      await redis.hSet(
        DEAD_LETTER_HASH_KEY,
        jobId,
        safeSerialize({
          ...jobEnvelope,
          error: normalizeError(processingError),
        }),
      );

      return NextResponse.json(
        { error: "Falha ao processar evento da Evolution API." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Evolution webhook - erro inesperado", error);
    return NextResponse.json(
      { error: "Erro interno ao processar o webhook." },
      { status: 500 },
    );
  }
}

function extractApiKey(req: NextRequest): string | null {
  const headerCandidates = [
    req.headers.get("x-api-key"),
    req.headers.get("x-evolution-api-key"),
    req.headers.get("apikey"),
    req.headers.get("authorization"),
  ];

  for (const candidate of headerCandidates) {
    if (typeof candidate !== "string") {
      continue;
    }

    const trimmed = candidate.trim();

    if (!trimmed) {
      continue;
    }

    if (trimmed.toLowerCase().startsWith("bearer ")) {
      const token = trimmed.slice(7).trim();
      if (token) {
        return token;
      }
      continue;
    }

    return trimmed;
  }

  const url = new URL(req.url);
  const queryKey =
    url.searchParams.get("apikey") ?? url.searchParams.get("apiKey");

  if (queryKey && queryKey.trim()) {
    return queryKey.trim();
  }

  return null;
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } satisfies Record<string, unknown>;
  }

  return { message: String(error) } satisfies Record<string, unknown>;
}

function safeSerialize(value: unknown): string {
  return JSON.stringify(value, (_key, entry) => {
    if (typeof entry === "bigint") {
      return entry.toString();
    }

    if (entry instanceof Date) {
      return entry.toISOString();
    }

    if (entry instanceof Map) {
      return Object.fromEntries(entry.entries());
    }

    if (entry instanceof Set) {
      return Array.from(entry.values());
    }

    if (typeof entry === "undefined") {
      return null;
    }

    if (typeof entry === "symbol") {
      return entry.toString();
    }

    if (typeof entry === "function") {
      return entry.toString();
    }

    return entry;
  });
}
