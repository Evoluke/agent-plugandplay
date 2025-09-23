import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

import { enqueue, setCache } from "@/lib/redis";
import { supabaseadmin } from "@/lib/supabaseAdmin";

const MESSAGE_QUEUE_KEY = "evolution:incoming-messages";
const MESSAGE_CACHE_TTL_SECONDS = 60 * 60; // 1 hora
const CONVERSATION_CACHE_TTL_SECONDS = 2 * 60 * 60; // 2 horas

type Nullable<T> = T | null;

type EvolutionInstanceRecord = {
  id: string;
  company_id: Nullable<number>;
  api_key_hash: string;
  metadata: Record<string, unknown> | null;
};

type EvolutionConversationRecord = {
  id: string;
  instance_id: string;
  company_id: Nullable<number>;
  remote_jid: string;
  sender_lid: Nullable<string>;
  push_name: Nullable<string>;
  sender: Nullable<string>;
  last_message_id: Nullable<string>;
  last_message_type: Nullable<string>;
  last_message_status: Nullable<string>;
  last_message_preview: Nullable<string>;
  last_message_timestamp: Nullable<string>;
  chatwoot_conversation_id: Nullable<string>;
  chatwoot_inbox_id: Nullable<string>;
  metadata: Record<string, unknown>;
  updated_at: string;
};

type EvolutionMessageRecord = {
  id: string;
  instance_id: string;
  conversation_id: string;
  company_id: Nullable<number>;
  message_id: string;
  remote_jid: string;
  sender_lid: Nullable<string>;
  from_me: boolean;
  push_name: Nullable<string>;
  sender: Nullable<string>;
  status: Nullable<string>;
  message_type: Nullable<string>;
  message_timestamp: Nullable<string>;
  message_text: Nullable<string>;
  source: Nullable<string>;
  destination: Nullable<string>;
  webhook_url: Nullable<string>;
  server_url: Nullable<string>;
  chatwoot_message_id: Nullable<string>;
  chatwoot_conversation_id: Nullable<string>;
  chatwoot_inbox_id: Nullable<string>;
  event_datetime: Nullable<string>;
  execution_mode: Nullable<string>;
  created_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNullableString(value: unknown): Nullable<string> {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function toNullableBigint(value: unknown): Nullable<string> {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value).toString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^-?\d+$/.test(trimmed)) {
      return trimmed;
    }
  }

  return null;
}

function toNullableBoolean(value: unknown): Nullable<boolean> {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "y"].includes(normalized)) {
      return true;
    }
    if (["0", "false", "no", "n"].includes(normalized)) {
      return false;
    }
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }

  return null;
}

function normalizeTimestamp(value: unknown): Nullable<string> {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value > 1e12 ? value : value * 1000).toISOString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) {
      const numeric = Number.parseFloat(trimmed);
      if (Number.isFinite(numeric)) {
        return new Date(numeric > 1e12 ? numeric : numeric * 1000).toISOString();
      }
    }

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return null;
}

function sanitizeJsonValue<T>(value: T, fallback: unknown = {}): unknown {
  if (value === undefined || value === null) {
    return fallback;
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    console.error("[evolution-webhook] Falha ao normalizar JSON", error);
    return fallback;
  }
}

function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey, "utf8").digest("hex");
}

async function runRedisTasks(tasks: Array<() => Promise<unknown>>): Promise<void> {
  await Promise.all(
    tasks.map((task) => {
      try {
        return task().catch((error) => {
          console.error("[redis] Falha ao executar operação", error);
        });
      } catch (error) {
        console.error("[redis] Falha ao iniciar operação", error);
        return Promise.resolve();
      }
    })
  );
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    console.error("[evolution-webhook] Corpo inválido", error);
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!isRecord(payload)) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const data = isRecord(payload.data) ? payload.data : null;
  const key = data && isRecord(data.key) ? data.key : null;

  if (!data || !key) {
    return NextResponse.json({ error: "Estrutura de payload inesperada" }, { status: 400 });
  }

  const instanceExternalId = toNullableString(data.instanceId);
  const apiKey = toNullableString(data.apikey);
  const remoteJid = toNullableString(key.remoteJid);
  const messageIdentifier = toNullableString(key.id);

  if (!instanceExternalId || !apiKey) {
    return NextResponse.json({ error: "Credenciais ausentes" }, { status: 400 });
  }

  if (!remoteJid || !messageIdentifier) {
    return NextResponse.json({ error: "Dados de mensagem incompletos" }, { status: 400 });
  }

  const { data: instance, error: instanceError } = await supabaseadmin
    .from("evolution_instances")
    .select("id, company_id, api_key_hash, metadata")
    .eq("external_id", instanceExternalId)
    .maybeSingle<EvolutionInstanceRecord>();

  if (instanceError) {
    console.error("[evolution-webhook] Erro ao buscar instância", instanceError);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }

  if (!instance) {
    return NextResponse.json({ error: "Instância não registrada" }, { status: 404 });
  }

  const incomingHash = hashApiKey(apiKey);

  if (incomingHash !== instance.api_key_hash) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const messageTimestamp = normalizeTimestamp(data.messageTimestamp);
  const eventDateTime = normalizeTimestamp(data.date_time ?? payload.date_time);
  const pushName = toNullableString(data.pushName);
  const status = toNullableString(data.status);
  const messageType = toNullableString(data.messageType);
  const sender = toNullableString(data.sender);
  const senderLid = toNullableString(key.senderLid);
  const source = toNullableString(data.source);
  const destination = toNullableString(data.destination);
  const webhookUrl = toNullableString(payload.webhookUrl);
  const executionMode = toNullableString(payload.executionMode ?? data.executionMode);
  const fromMe = toNullableBoolean(key.fromMe) ?? false;
  const serverUrl = toNullableString(data.server_url);
  const normalizedWebhookUrl = webhookUrl ?? destination ?? null;

  const messageObject = isRecord(data.message) ? data.message : null;
  const messageText = messageObject?.conversation && typeof messageObject.conversation === "string"
    ? messageObject.conversation
    : null;
  const messagePayload = sanitizeJsonValue(data.message, {});
  const rawPayload = sanitizeJsonValue(data, {});
  const messageContextInfo =
    messageObject && Object.prototype.hasOwnProperty.call(messageObject, "messageContextInfo")
      ? sanitizeJsonValue(messageObject.messageContextInfo, null)
      : null;

  const chatwootMessageId = toNullableBigint(data.chatwootMessageId);
  const chatwootConversationId = toNullableBigint(data.chatwootConversationId);
  const chatwootInboxId = toNullableBigint(data.chatwootInboxId);

  const conversationMetadata: Record<string, unknown> = {};
  if (messageContextInfo !== null) {
    conversationMetadata.messageContextInfo = messageContextInfo;
  }

  const conversationUpsert: Record<string, unknown> = {
    instance_id: instance.id,
    company_id: instance.company_id ?? null,
    remote_jid: remoteJid,
    last_message_id: messageIdentifier,
    last_message_type: messageType ?? null,
    last_message_status: status ?? null,
    last_message_preview: messageText ?? null,
    last_message_timestamp: messageTimestamp ?? null,
    updated_at: new Date().toISOString(),
  };

  if (senderLid !== null) {
    conversationUpsert.sender_lid = senderLid;
  }

  if (pushName !== null) {
    conversationUpsert.push_name = pushName;
  }

  if (sender !== null) {
    conversationUpsert.sender = sender;
  }

  if (chatwootConversationId !== null) {
    conversationUpsert.chatwoot_conversation_id = chatwootConversationId;
  }

  if (chatwootInboxId !== null) {
    conversationUpsert.chatwoot_inbox_id = chatwootInboxId;
  }

  if (Object.keys(conversationMetadata).length) {
    conversationUpsert.metadata = conversationMetadata;
  }

  const { data: conversationRows, error: conversationError } = await supabaseadmin
    .from("evolution_conversations")
    .upsert([conversationUpsert], { onConflict: "instance_id,remote_jid" })
    .select()
    .limit(1);

  if (conversationError) {
    console.error("[evolution-webhook] Erro ao salvar conversa", conversationError);
    return NextResponse.json({ error: "Falha ao registrar conversa" }, { status: 500 });
  }

  const conversation = (conversationRows?.[0] ?? null) as Nullable<EvolutionConversationRecord>;

  if (!conversation) {
    return NextResponse.json({ error: "Conversa não registrada" }, { status: 500 });
  }

  const messageInsert = {
    instance_id: instance.id,
    conversation_id: conversation.id,
    company_id: instance.company_id ?? null,
    message_id: messageIdentifier,
    remote_jid: remoteJid,
    sender_lid: senderLid,
    from_me: fromMe,
    push_name: pushName,
    sender,
    status,
    message_type: messageType,
    message_timestamp: messageTimestamp,
    message_text: messageText,
    message_payload: messagePayload,
    raw_payload: rawPayload,
    source,
    destination,
    webhook_url: normalizedWebhookUrl,
    server_url: serverUrl,
    chatwoot_message_id: chatwootMessageId,
    chatwoot_conversation_id: chatwootConversationId,
    chatwoot_inbox_id: chatwootInboxId,
    event_datetime: eventDateTime,
    execution_mode: executionMode,
  };

  const { data: messageRows, error: messageError } = await supabaseadmin
    .from("evolution_messages")
    .upsert([messageInsert], { onConflict: "instance_id,message_id" })
    .select()
    .limit(1);

  if (messageError) {
    console.error("[evolution-webhook] Erro ao salvar mensagem", messageError);
    return NextResponse.json({ error: "Falha ao registrar mensagem" }, { status: 500 });
  }

  const message = (messageRows?.[0] ?? null) as Nullable<EvolutionMessageRecord>;

  if (!message) {
    return NextResponse.json({ error: "Mensagem não registrada" }, { status: 500 });
  }

  const instanceUpdates: Record<string, unknown> = {
    last_event_at: new Date().toISOString(),
  };

  if (serverUrl) {
    instanceUpdates.server_url = serverUrl;
  }

  if (normalizedWebhookUrl) {
    instanceUpdates.webhook_url = normalizedWebhookUrl;
  }

  const metadataUpdates: Record<string, unknown> = {};
  if (Object.prototype.hasOwnProperty.call(conversationMetadata, "messageContextInfo")) {
    const contextInfo = (conversationMetadata as Record<string, unknown>).messageContextInfo;
    metadataUpdates.lastMessageContextInfo = contextInfo;
  }

  if (destination) {
    metadataUpdates.lastDestination = destination;
  }

  if (source) {
    metadataUpdates.lastSource = source;
  }

  if (executionMode) {
    metadataUpdates.lastExecutionMode = executionMode;
  }

  if (messageTimestamp) {
    metadataUpdates.lastMessageTimestamp = messageTimestamp;
  }

  if (serverUrl) {
    metadataUpdates.lastServerUrl = serverUrl;
  }

  if (Object.keys(metadataUpdates).length) {
    const currentMetadata =
      instance.metadata && isRecord(instance.metadata) ? instance.metadata : {};
    instanceUpdates.metadata = { ...currentMetadata, ...metadataUpdates };
  }

  const updateResult = await supabaseadmin
    .from("evolution_instances")
    .update(instanceUpdates)
    .eq("id", instance.id);

  if (updateResult.error) {
    console.error("[evolution-webhook] Erro ao atualizar instância", updateResult.error);
  }

  const conversationCachePayload = {
    id: conversation.id,
    instanceId: conversation.instance_id,
    companyId: conversation.company_id,
    remoteJid: conversation.remote_jid,
    pushName: conversation.push_name,
    lastMessageId: conversation.last_message_id,
    lastMessageType: conversation.last_message_type,
    lastMessageStatus: conversation.last_message_status,
    lastMessagePreview: conversation.last_message_preview,
    lastMessageTimestamp: conversation.last_message_timestamp,
    updatedAt: conversation.updated_at,
  };

  const messageCachePayload = {
    id: message.id,
    instanceId: message.instance_id,
    conversationId: message.conversation_id,
    companyId: message.company_id,
    messageId: message.message_id,
    remoteJid: message.remote_jid,
    fromMe: message.from_me,
    status: message.status,
    messageType: message.message_type,
    messageText: message.message_text,
    messageTimestamp: message.message_timestamp,
    createdAt: message.created_at,
  };

  await runRedisTasks([
    () =>
      enqueue(
        MESSAGE_QUEUE_KEY,
        JSON.stringify({
          id: message.id,
          messageId: message.message_id,
          instanceId: message.instance_id,
          conversationId: message.conversation_id,
          companyId: message.company_id,
          remoteJid: message.remote_jid,
          fromMe: message.from_me,
          status: message.status,
          messageType: message.message_type,
          messageTimestamp: message.message_timestamp,
        })
      ),
    () =>
      setCache(
        `evolution:message:${message.id}`,
        JSON.stringify(messageCachePayload),
        MESSAGE_CACHE_TTL_SECONDS
      ),
    () =>
      setCache(
        `evolution:message:${message.message_id}`,
        JSON.stringify(messageCachePayload),
        MESSAGE_CACHE_TTL_SECONDS
      ),
    () =>
      setCache(
        `evolution:conversation:${conversation.id}`,
        JSON.stringify(conversationCachePayload),
        CONVERSATION_CACHE_TTL_SECONDS
      ),
    () =>
      setCache(
        `evolution:conversation:${conversation.instance_id}:${conversation.remote_jid}`,
        JSON.stringify(conversationCachePayload),
        CONVERSATION_CACHE_TTL_SECONDS
      ),
  ]);

  return NextResponse.json({
    success: true,
    conversationId: conversation.id,
    messageId: message.id,
  });
}
