import { NextRequest, NextResponse } from 'next/server';

import {
  applyEvolutionMessageUpdate,
  normalizeEvolutionMessage,
  persistEvolutionMessage,
  resolveEvolutionInstance,
  type EvolutionWebhookPayload,
} from '@/lib/evolutionWebhook';

function normalizeEventName(event?: string | null): string | undefined {
  if (!event || typeof event !== 'string') {
    return undefined;
  }

  const trimmed = event.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/-/g, '_').toUpperCase();
}

function extractMessages(source: unknown): unknown[] {
  if (!source) {
    return [];
  }

  if (Array.isArray(source)) {
    return source;
  }

  if (typeof source === 'object' && source !== null) {
    const record = source as Record<string, unknown>;

    if (Array.isArray(record.messages)) {
      return record.messages;
    }

    if (Array.isArray(record.message)) {
      return record.message;
    }

    if (record.message) {
      return [record.message];
    }
  }

  return [];
}

function extractToken(request: NextRequest): string | undefined {
  const candidates = [
    request.headers.get('x-evolution-token'),
    request.headers.get('x-webhook-token'),
    request.headers.get('authorization'),
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const value = candidate.replace(/^Bearer\s+/i, '').trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

const GLOBAL_WEBHOOK_TOKEN = process.env.EVOLUTION_WEBHOOK_TOKEN;

export async function POST(
  request: NextRequest,
  context: { params: { slug?: string[] } },
): Promise<NextResponse> {
  let payload: EvolutionWebhookPayload;

  try {
    payload = await request.json();
  } catch (error) {
    console.error('[evolution] JSON inválido recebido no webhook', error);
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const eventFromBody = normalizeEventName(payload.event);
  const eventFromPath = normalizeEventName(context.params?.slug?.[0]);
  const event = eventFromBody ?? eventFromPath;

  if (!event) {
    return NextResponse.json({ error: 'Evento não informado' }, { status: 400 });
  }

  const dataRecord =
    payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>)
      : undefined;

  const instanceId =
    getString(payload.instanceId) ??
    getString(dataRecord?.instanceId) ??
    getString(dataRecord?.instance_id);

  const instanceName =
    getString(payload.instanceName ?? payload.instance) ??
    getString(dataRecord?.instanceName) ??
    getString(dataRecord?.instance);

  let instance;

  try {
    instance = await resolveEvolutionInstance({ instanceId, instanceName });
  } catch (error) {
    console.error('[evolution] Falha ao consultar instância', error);
    return NextResponse.json({ error: 'Falha ao consultar instância' }, { status: 500 });
  }

  if (!instance) {
    return NextResponse.json({ error: 'Instância não localizada' }, { status: 404 });
  }

  const token = extractToken(request);
  const expectedTokens = [instance.webhook_token, GLOBAL_WEBHOOK_TOKEN].filter(Boolean) as string[];

  if (expectedTokens.length > 0 && (!token || !expectedTokens.includes(token))) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
  }

  const messages = [
    ...extractMessages(payload.data),
    ...extractMessages((payload as Record<string, unknown>).messages),
  ];

  if (event === 'MESSAGES_UPSERT' || event === 'SEND_MESSAGE') {
    let processed = 0;

    for (const raw of messages) {
      const normalized = normalizeEvolutionMessage(raw);

      if (!normalized) {
        continue;
      }

      try {
        const persisted = await persistEvolutionMessage(instance, normalized);
        if (persisted) {
          processed += 1;
        }
      } catch (error) {
        console.error('[evolution] Erro ao persistir mensagem', error);
      }
    }

    return NextResponse.json({ success: true, processed }, { status: 200 });
  }

  if (event === 'MESSAGES_UPDATE') {
    let updated = 0;

    for (const raw of messages) {
      try {
        const applied = await applyEvolutionMessageUpdate(instance, raw);
        if (applied) {
          updated += 1;
        }
      } catch (error) {
        console.error('[evolution] Erro ao atualizar status da mensagem', error);
      }
    }

    return NextResponse.json({ success: true, updated }, { status: 200 });
  }

  return NextResponse.json({ success: true, ignored: event }, { status: 200 });
}
