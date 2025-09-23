import { supabaseadmin } from '@/lib/supabaseAdmin';
import { enqueue, setCache } from '@/lib/redis';

type JsonRecord = Record<string, unknown>;

export interface EvolutionInstanceRecord {
  id: string;
  company_id: number;
  instance_id: string | null;
  instance_name: string;
  webhook_token: string;
}

export interface EvolutionWebhookPayload {
  event?: string;
  instanceId?: string;
  instanceName?: string;
  instance?: string;
  data?: unknown;
}

export interface NormalizedEvolutionMessage {
  messageId: string;
  chatId: string;
  fromMe: boolean;
  direction: 'inbound' | 'outbound';
  sender?: string;
  senderName?: string;
  type: string;
  status?: string;
  body?: string | null;
  sentAt: Date;
  isGroup: boolean;
  contactNumber?: string;
  contactWaId?: string;
  raw: JsonRecord;
}

export const INCOMING_QUEUE_KEY = 'evolution:messages:incoming';
export const STATUS_QUEUE_KEY = 'evolution:messages:status';
export const MESSAGE_CACHE_PREFIX = 'evolution:message:';
export const CONVERSATION_CACHE_PREFIX = 'evolution:conversation:last:';
const MESSAGE_CACHE_TTL_SECONDS = 300;

function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);
}

async function safeEnqueue(queue: string, value: JsonRecord): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    await enqueue(queue, JSON.stringify(value));
  } catch (error) {
    console.error(`[redis] Falha ao enfileirar dados em ${queue}`, error);
  }
}

async function safeCache(key: string, value: JsonRecord, ttlSeconds = MESSAGE_CACHE_TTL_SECONDS): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    await setCache(key, JSON.stringify(value), ttlSeconds);
  } catch (error) {
    console.error(`[redis] Falha ao salvar cache ${key}`, error);
  }
}

function toJsonRecord(value: unknown): JsonRecord {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (error) {
      console.error('[evolution] Não foi possível serializar o payload recebido', error);
    }
  }

  return {};
}

function parseTimestamp(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const timestamp = value > 9_999_999_999 ? value : value * 1000;
    return new Date(timestamp);
  }

  if (typeof value === 'string' && value.trim()) {
    const numeric = Number(value);

    if (!Number.isNaN(numeric)) {
      const timestamp = numeric > 9_999_999_999 ? numeric : numeric * 1000;
      return new Date(timestamp);
    }

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
}

function extractTextFromMessage(raw: JsonRecord): string | null {
  const { body, text, message } = raw;

  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }

  if (typeof text === 'string' && text.trim()) {
    return text.trim();
  }

  if (message && typeof message === 'object' && !Array.isArray(message)) {
    const nested = message as JsonRecord;

    if (typeof nested.conversation === 'string' && nested.conversation.trim()) {
      return nested.conversation.trim();
    }

    const extended = nested.extendedTextMessage as JsonRecord | undefined;
    if (extended && typeof extended.text === 'string' && extended.text.trim()) {
      return extended.text.trim();
    }

    const image = nested.imageMessage as JsonRecord | undefined;
    if (image && typeof image.caption === 'string' && image.caption.trim()) {
      return image.caption.trim();
    }

    const buttons = nested.buttonsResponseMessage as JsonRecord | undefined;
    if (buttons && typeof buttons.selectedDisplayText === 'string' && buttons.selectedDisplayText.trim()) {
      return buttons.selectedDisplayText.trim();
    }
  }

  return null;
}

function sanitizePreview(body: string | null | undefined, type: string): string | null {
  if (body && body.trim()) {
    const trimmed = body.trim();
    return trimmed.length > 280 ? `${trimmed.slice(0, 277)}...` : trimmed;
  }

  if (type) {
    return `[${type}]`;
  }

  return null;
}

function readString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function findChatId(raw: JsonRecord, key?: JsonRecord): string | undefined {
  const candidates: Array<unknown> = [
    raw.chatId,
    raw.chat_id,
    raw.remoteJid,
    raw.jid,
    raw.to,
    raw.from,
  ];

  if (key) {
    candidates.push(key.remoteJid, key.remotejid, key.id);
  }

  for (const candidate of candidates) {
    const value = readString(candidate);
    if (value) {
      const normalized = value.trim();
      if (normalized) {
        return normalized;
      }
    }
  }

  return undefined;
}

function extractSender(raw: JsonRecord, key?: JsonRecord): string | undefined {
  const candidates: Array<unknown> = [
    raw.participant,
    raw.author,
    raw.sender,
    raw.from,
  ];

  if (key) {
    candidates.push(key.participant, key.remoteJid);
  }

  for (const candidate of candidates) {
    const value = readString(candidate);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function extractSenderName(raw: JsonRecord): string | undefined {
  const candidates: Array<unknown> = [
    raw.pushName,
    raw.pushname,
    raw.senderName,
    raw.contactName,
    raw.name,
    raw.displayName,
  ];

  for (const candidate of candidates) {
    const value = readString(candidate);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function extractType(raw: JsonRecord): string {
  const candidates: Array<unknown> = [
    raw.type,
    raw.messageType,
    raw.message_type,
  ];

  for (const candidate of candidates) {
    const value = readString(candidate);
    if (value) {
      return value;
    }
  }

  const message = raw.message;
  if (message && typeof message === 'object' && !Array.isArray(message)) {
    const keys = Object.keys(message as JsonRecord);
    if (keys.length > 0) {
      return keys[0];
    }
  }

  return 'unknown';
}

function extractStatus(raw: JsonRecord): string | undefined {
  const candidates: Array<unknown> = [
    raw.status,
    raw.messageStatus,
    raw.ack,
    raw.acknowledged,
  ];

  for (const candidate of candidates) {
    const value = readString(candidate);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') {
      return true;
    }

    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }

  return undefined;
}

export async function resolveEvolutionInstance({
  instanceId,
  instanceName,
}: {
  instanceId?: string | null;
  instanceName?: string | null;
}): Promise<EvolutionInstanceRecord | null> {
  const filters: string[] = [];

  if (instanceId) {
    filters.push(`instance_id.eq.${instanceId}`);
  }

  if (instanceName) {
    filters.push(`instance_name.eq.${instanceName}`);
  }

  if (filters.length === 0) {
    return null;
  }

  const query = supabaseadmin
    .from('evolution_instances')
    .select('id, company_id, instance_id, instance_name, webhook_token')
    .limit(1);

  if (filters.length > 0) {
    query.or(filters.join(','));
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`[evolution] Falha ao localizar instância: ${error.message}`);
  }

  return data ?? null;
}

export function normalizeEvolutionMessage(raw: unknown): NormalizedEvolutionMessage | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const record = raw as JsonRecord;
  const key = record.key && typeof record.key === 'object' && !Array.isArray(record.key)
    ? (record.key as JsonRecord)
    : undefined;

  const messageId = readString(record.id) || readString(record.messageId) || (key ? readString(key.id) : undefined);
  const chatId = findChatId(record, key);

  if (!messageId || !chatId) {
    return null;
  }

  const fromMe = parseBoolean(record.fromMe) ?? (key ? parseBoolean(key.fromMe) ?? false : false);
  const direction: 'inbound' | 'outbound' = fromMe ? 'outbound' : 'inbound';
  const sender = extractSender(record, key);
  const senderName = extractSenderName(record);
  const type = extractType(record);
  const status = extractStatus(record);
  const body = extractTextFromMessage(record);

  const timestampValue = record.timestamp ?? record.messageTimestamp ?? record.msgTimestamp ?? record.created_at ?? record.updated_at;
  const sentAt = parseTimestamp(timestampValue);

  const contactWaId = chatId;
  const contactNumber = chatId.includes('@') ? chatId.split('@')[0] : chatId;
  const lowerChatId = chatId.toLowerCase();
  const isGroup = lowerChatId.endsWith('@g.us') || lowerChatId.endsWith('@broadcast');

  return {
    messageId,
    chatId,
    fromMe,
    direction,
    sender,
    senderName,
    type,
    status,
    body,
    sentAt,
    isGroup,
    contactNumber,
    contactWaId,
    raw: toJsonRecord(record),
  };
}

export async function persistEvolutionMessage(
  instance: EvolutionInstanceRecord,
  normalized: NormalizedEvolutionMessage,
): Promise<{ conversationId: string; messageId: string } | null> {
  const nowIso = new Date().toISOString();

  const conversationPayload: Record<string, unknown> = {
    company_id: instance.company_id,
    instance_id: instance.instance_id,
    instance_name: instance.instance_name,
    chat_id: normalized.chatId,
    contact_wa_id: normalized.contactWaId,
    contact_number: normalized.contactNumber,
    is_group: normalized.isGroup,
    last_message_id: normalized.messageId,
    last_message_preview: sanitizePreview(normalized.body, normalized.type),
    last_message_direction: normalized.direction,
    last_message_at: normalized.sentAt.toISOString(),
    updated_at: nowIso,
  };

  if (normalized.senderName) {
    conversationPayload.contact_name = normalized.senderName;
  }

  const { data: conversation, error: conversationError } = await supabaseadmin
    .from('whatsapp_conversations')
    .upsert(conversationPayload, { onConflict: 'company_id,chat_id' })
    .select('id, company_id, chat_id')
    .single();

  if (conversationError) {
    console.error('[evolution] Falha ao salvar conversa', conversationError);
    return null;
  }

  const messagePayload: Record<string, unknown> = {
    company_id: instance.company_id,
    conversation_id: conversation.id,
    instance_name: instance.instance_name,
    message_id: normalized.messageId,
    chat_id: normalized.chatId,
    direction: normalized.direction,
    from_me: normalized.fromMe,
    sender: normalized.sender,
    sender_name: normalized.senderName,
    type: normalized.type,
    status: normalized.status,
    body: normalized.body,
    raw_payload: normalized.raw,
    sent_at: normalized.sentAt.toISOString(),
    updated_at: nowIso,
  };

  const { data: message, error: messageError } = await supabaseadmin
    .from('whatsapp_messages')
    .upsert(messagePayload, { onConflict: 'company_id,message_id' })
    .select('id, message_id, conversation_id, company_id, status, direction')
    .single();

  if (messageError) {
    console.error('[evolution] Falha ao salvar mensagem', messageError);
    return null;
  }

  const conversationCachePayload: JsonRecord = {
    id: conversation.id,
    chat_id: normalized.chatId,
    last_message_id: normalized.messageId,
    last_message_preview: sanitizePreview(normalized.body, normalized.type),
    last_message_direction: normalized.direction,
    last_message_at: normalized.sentAt.toISOString(),
  };

  const messageCachePayload: JsonRecord = {
    id: message.id,
    company_id: message.company_id,
    conversation_id: message.conversation_id,
    message_id: message.message_id,
    status: message.status,
    direction: message.direction,
  };

  await safeCache(`${CONVERSATION_CACHE_PREFIX}${conversation.id}`, conversationCachePayload);
  await safeCache(`${MESSAGE_CACHE_PREFIX}${message.message_id}`, messageCachePayload);

  await safeEnqueue(INCOMING_QUEUE_KEY, {
    company_id: message.company_id,
    conversation_id: message.conversation_id,
    message_id: message.message_id,
    direction: message.direction,
  });

  return { conversationId: conversation.id, messageId: message.message_id };
}

export async function applyEvolutionMessageUpdate(
  instance: EvolutionInstanceRecord,
  raw: unknown,
): Promise<boolean> {
  const normalized = normalizeEvolutionMessage(raw);

  if (!normalized) {
    return false;
  }

  if (!normalized.status) {
    return false;
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseadmin
    .from('whatsapp_messages')
    .update({ status: normalized.status, updated_at: nowIso })
    .eq('company_id', instance.company_id)
    .eq('message_id', normalized.messageId)
    .select('id, message_id, conversation_id, company_id, status')
    .maybeSingle();

  if (error) {
    console.error('[evolution] Falha ao atualizar status da mensagem', error);
    return false;
  }

  if (!data) {
    return false;
  }

  await safeCache(`${MESSAGE_CACHE_PREFIX}${data.message_id}`, {
    id: data.id,
    company_id: data.company_id,
    conversation_id: data.conversation_id,
    message_id: data.message_id,
    status: data.status,
  });

  await safeEnqueue(STATUS_QUEUE_KEY, {
    company_id: data.company_id,
    conversation_id: data.conversation_id,
    message_id: data.message_id,
    status: data.status,
  });

  return true;
}
