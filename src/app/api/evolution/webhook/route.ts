import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";

import { EVOLUTION_MEDIA_QUEUE } from "@/lib/constants";
import { enqueue } from "@/lib/redis";
import { supabaseadmin } from "@/lib/supabaseAdmin";

const SIGNATURE_HEADER = "x-evolution-signature";
const COMPANY_HEADER = "x-company-id";

type WhatsappMessageDirection = "inbound" | "outbound";
type WhatsappMessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "received"
  | "failed";
type WhatsappMessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "sticker"
  | "location"
  | "contact"
  | "unknown"
  | "reaction";
type WhatsappConversationStatus = "open" | "pending" | "closed" | "archived";

interface NormalizedContact {
  whatsappId: string;
  phoneNumber: string;
  displayName?: string;
  profileName?: string;
  isBusiness?: boolean;
  extras?: Record<string, unknown>;
}

interface NormalizedConversation {
  remoteJid: string;
  instanceId?: string;
  status?: WhatsappConversationStatus;
}

interface NormalizedMedia {
  type: WhatsappMessageType;
  providerMediaId?: string;
  url?: string;
  mimeType?: string;
  fileName?: string;
  fileSizeBytes?: number;
  sha256?: string;
  metadata?: Record<string, unknown>;
}

interface NormalizedMessageDetails {
  evolutionMessageId: string;
  direction: WhatsappMessageDirection;
  type: WhatsappMessageType;
  status: WhatsappMessageStatus;
  body?: string;
  caption?: string;
  occurredAt: string;
  rawPayload: Record<string, unknown>;
  media: NormalizedMedia[];
}

interface NormalizedWebhookMessage {
  companyId: number;
  contact: NormalizedContact;
  conversation: NormalizedConversation;
  message: NormalizedMessageDetails;
  originalContext: Record<string, unknown>;
  originalMessage: Record<string, unknown>;
}

interface WhatsappContactRow {
  id: string;
  company_id: number;
  whatsapp_id: string;
}

interface WhatsappConversationRow {
  id: string;
  company_id: number;
  contact_id: string;
  remote_jid: string;
}

interface WhatsappMessageRow {
  id: string;
  company_id: number;
  conversation_id: string;
  evolution_message_id: string;
}

interface PersistResult {
  contact: WhatsappContactRow;
  conversation: WhatsappConversationRow;
  message: WhatsappMessageRow;
  queueAttachments: Array<{
    providerMediaId: string;
    originalProviderMediaId?: string;
    url?: string;
    mimeType?: string;
    fileName?: string;
    sha256?: string;
  }>;
}

function parseCompanyHeader(value: string | null): number | undefined {
  return coerceNumber(value) ?? undefined;
}

function normalizePayload(
  payload: unknown,
  fallbackCompanyId?: number
): NormalizedWebhookMessage[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const context = payload as Record<string, unknown>;
  const rawMessages = collectRawMessages(context);
  const normalized: NormalizedWebhookMessage[] = [];

  for (const raw of rawMessages) {
    const entry = normalizeSingleMessage(raw, context, fallbackCompanyId);
    if (entry) {
      normalized.push(entry);
    }
  }

  return normalized;
}

function collectRawMessages(context: Record<string, unknown>): unknown[] {
  const buckets: unknown[] = [];

  const directMessages = context.messages;
  if (Array.isArray(directMessages)) {
    buckets.push(...directMessages);
  }

  const data = context.data;
  if (data && typeof data === "object") {
    const dataRecord = data as Record<string, unknown>;
    const dataMessages = dataRecord.messages;
    if (Array.isArray(dataMessages)) {
      buckets.push(...dataMessages);
    }

    const nestedMessage = dataRecord.message;
    if (nestedMessage && typeof nestedMessage === "object") {
      buckets.push(nestedMessage);
    }
  }

  const single = context.message;
  if (single && typeof single === "object") {
    buckets.push(single);
  }

  if (buckets.length === 0 && isLikelyMessage(context)) {
    buckets.push(context);
  }

  return buckets;
}

function isLikelyMessage(payload: Record<string, unknown>): boolean {
  return (
    typeof payload.type === "string" ||
    typeof payload.body === "string" ||
    typeof payload.id === "string" ||
    typeof payload.message === "object"
  );
}

function normalizeSingleMessage(
  rawValue: unknown,
  context: Record<string, unknown>,
  fallbackCompanyId?: number
): NormalizedWebhookMessage | null {
  if (!rawValue || typeof rawValue !== "object") {
    return null;
  }

  const raw = rawValue as Record<string, unknown>;
  const remoteJid =
    safeString(raw.remoteJid) ||
    safeString(raw.chatId) ||
    safeString(getNested(raw, ["key", "remoteJid"])) ||
    safeString(getNested(raw, ["message", "key", "remoteJid"])) ||
    safeString(context.remoteJid);

  if (!remoteJid) {
    return null;
  }

  const companyId = resolveCompanyId(context, raw, fallbackCompanyId);

  if (companyId === null) {
    console.error("[evolution-webhook] companyId ausente no payload", {
      context,
      raw,
    });
    return null;
  }

  const messageId =
    safeString(raw.id) ||
    safeString(raw.messageId) ||
    safeString(raw.message_id) ||
    safeString(getNested(raw, ["key", "id"])) ||
    safeString(getNested(raw, ["message", "key", "id"])) ||
    safeString(getNested(raw, ["message", "id"])) ||
    safeString(raw.mid) ||
    safeString(raw.msgId) ||
    safeString(raw.messageNumber) ||
    randomUUID();

  const fromMe = resolveBoolean(
    raw.fromMe ??
      raw.from_me ??
      getNested(raw, ["key", "fromMe"]) ??
      getNested(raw, ["message", "key", "fromMe"]) ??
      getNested(raw, ["message", "fromMe"]) ??
      getNested(context, ["key", "fromMe"])
  );

  const direction: WhatsappMessageDirection = fromMe ? "outbound" : "inbound";

  const timestamp =
    raw.timestamp ??
    raw.messageTimestamp ??
    raw.message_time ??
    raw.time ??
    getNested(raw, ["message", "timestamp"]) ??
    getNested(context, ["timestamp"]);

  const occurredAt = parseTimestamp(timestamp);

  const contact = normalizeContact(remoteJid, raw, context);
  if (!contact) {
    return null;
  }

  const media = normalizeMediaEntries(raw);

  const body =
    safeString(raw.body) ||
    safeString(raw.text) ||
    safeString(raw.messageText) ||
    safeString(getNested(raw, ["message", "conversation"])) ||
    safeString(getNested(raw, ["message", "extendedTextMessage", "text"])) ||
    undefined;

  const caption =
    safeString(raw.caption) ||
    safeString(getNested(raw, ["message", "caption"])) ||
    safeString(getNested(raw, ["message", "imageMessage", "caption"])) ||
    safeString(getNested(raw, ["message", "videoMessage", "caption"])) ||
    undefined;

  const typeValue =
    raw.type ??
    raw.messageType ??
    raw.subtype ??
    getNested(raw, ["message", "type"]);

  const hasMedia = media.length > 0;
  const hasBody = typeof body === "string" && body.length > 0;
  const messageType = mapMessageType(typeValue, hasMedia, hasBody);

  const normalizedMedia: NormalizedMedia[] = media.map((item) => {
    if (item.type === "unknown") {
      if (messageType !== "text" && messageType !== "unknown") {
        return { ...item, type: messageType };
      }
      if (hasMedia) {
        return { ...item, type: "document" };
      }
    }
    return item;
  });

  const status = mapStatus(
    raw.status ??
      raw.ack ??
      getNested(raw, ["message", "status"]) ??
      getNested(raw, ["message", "ack"]) ??
      getNested(context, ["status"]),
    direction
  );

  const conversation: NormalizedConversation = {
    remoteJid,
    instanceId:
      safeString(context.instanceId) ||
      safeString(context.instance) ||
      safeString(raw.instanceId) ||
      safeString(raw.instance) ||
      safeString(getNested(raw, ["key", "id"])) ||
      undefined,
    status: direction === "inbound" ? "open" : undefined,
  };

  const rawPayload = buildRawPayload(context, raw);

  return {
    companyId,
    contact,
    conversation,
    message: {
      evolutionMessageId: messageId,
      direction,
      type: messageType,
      status,
      body,
      caption,
      occurredAt,
      rawPayload,
      media: normalizedMedia,
    },
    originalContext: context,
    originalMessage: raw,
  };
}

function normalizeContact(
  remoteJid: string,
  raw: Record<string, unknown>,
  context: Record<string, unknown>
): NormalizedContact | null {
  const phoneNumber = extractPhoneNumber(remoteJid);
  if (!phoneNumber) {
    return null;
  }

  const contactData = selectContactData(raw, context);

  const displayName =
    safeString(raw.senderName) ||
    safeString(raw.pushName) ||
    safeString(raw.notifyName) ||
    safeString(getNested(contactData, ["name"])) ||
    safeString(getNested(contactData, ["pushName"])) ||
    safeString(getNested(contactData, ["notifyName"])) ||
    safeString(getNested(contactData, ["verifiedName"])) ||
    safeString(context.senderName) ||
    undefined;

  const profileName =
    safeString(raw.profileName) ||
    safeString(raw.shortName) ||
    safeString(getNested(contactData, ["shortName"])) ||
    safeString(getNested(contactData, ["profileName"])) ||
    undefined;

  const isBusiness = resolveBoolean(
    raw.isBusiness ??
      getNested(contactData, ["isBusiness"]) ??
      getNested(contactData, ["verifiedBusiness"])
  );

  const extras = extractContactExtras(contactData);

  return {
    whatsappId: remoteJid,
    phoneNumber,
    displayName,
    profileName,
    isBusiness: isBusiness ?? undefined,
    extras,
  };
}

function selectContactData(
  raw: Record<string, unknown>,
  context: Record<string, unknown>
): Record<string, unknown> | undefined {
  const candidates = [
    raw.contact,
    getNested(raw, ["message", "contact"]),
    getNested(context, ["contact"]),
    getNested(context, ["data", "contact"]),
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object") {
      return candidate as Record<string, unknown>;
    }
  }

  return undefined;
}

function extractContactExtras(
  contact: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!contact) {
    return undefined;
  }

  const allowedKeys = [
    "id",
    "profilePicUrl",
    "shortName",
    "verifiedName",
    "businessName",
    "category",
    "pushName",
  ];

  const extras: Record<string, unknown> = {};

  for (const key of allowedKeys) {
    const value = contact[key];
    if (value !== undefined && value !== null) {
      extras[key] = value;
    }
  }

  return Object.keys(extras).length > 0 ? extras : undefined;
}

function normalizeMediaEntries(raw: Record<string, unknown>): NormalizedMedia[] {
  const mediaCandidates: unknown[] = [];

  const directCandidate = collectDirectMedia(raw);
  if (directCandidate) {
    mediaCandidates.push(directCandidate);
  }

  const attachments = [
    raw.media,
    raw.attachment,
    getNested(raw, ["message", "media"]),
    getNested(raw, ["message", "attachment"]),
  ];

  for (const attachment of attachments) {
    if (!attachment) continue;
    if (Array.isArray(attachment)) {
      mediaCandidates.push(...attachment);
    } else if (typeof attachment === "object") {
      mediaCandidates.push(attachment);
    }
  }

  const mediaArrays = [
    raw.mediaItems,
    raw.medias,
    getNested(raw, ["message", "mediaItems"]),
    getNested(raw, ["message", "medias"]),
  ];

  for (const collection of mediaArrays) {
    if (Array.isArray(collection)) {
      mediaCandidates.push(...collection);
    }
  }

  const normalized: NormalizedMedia[] = [];
  const seenKeys = new Set<string>();

  for (const candidate of mediaCandidates) {
    const media = normalizeMediaCandidate(candidate);
    if (!media) {
      continue;
    }

    const key =
      media.providerMediaId ||
      media.url ||
      (media.fileName && `${media.fileName}:${media.fileSizeBytes ?? ""}`);

    if (key && seenKeys.has(key)) {
      continue;
    }

    if (key) {
      seenKeys.add(key);
    }

    normalized.push(media);
  }

  return normalized;
}

function collectDirectMedia(
  raw: Record<string, unknown>
): Record<string, unknown> | undefined {
  const fields = [
    "mediaUrl",
    "downloadUrl",
    "url",
    "directPath",
    "fileName",
    "fileSize",
    "mimeType",
    "mimetype",
  ];

  for (const field of fields) {
    if (raw[field] !== undefined) {
      const direct: Record<string, unknown> = {};
      for (const key of fields) {
        if (raw[key] !== undefined) {
          direct[key] = raw[key];
        }
      }
      direct.type = raw.type ?? raw.messageType ?? raw.mediaType;
      direct.id = raw.mediaId ?? raw.fileId ?? raw.file_id ?? raw.media_id;
      direct.sha256 = raw.sha256 ?? raw.fileSha256 ?? raw.file_sha256;
      return direct;
    }
  }

  return undefined;
}

function normalizeMediaCandidate(candidate: unknown): NormalizedMedia | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const record = candidate as Record<string, unknown>;
  const url =
    safeString(record.url) ||
    safeString(record.mediaUrl) ||
    safeString(record.downloadUrl) ||
    safeString(record.directPath) ||
    undefined;
  const providerMediaId =
    safeString(record.providerMediaId) ||
    safeString(record.mediaId) ||
    safeString(record.media_id) ||
    safeString(record.fileId) ||
    safeString(record.file_id) ||
    safeString(record.id) ||
    undefined;
  const mimeType =
    safeString(record.mimeType) ||
    safeString(record.mimetype) ||
    safeString(record.contentType) ||
    undefined;
  const fileName =
    safeString(record.fileName) ||
    safeString(record.filename) ||
    safeString(record.name) ||
    undefined;
  const fileSize = coerceNumber(
    record.fileSize ?? record.file_size ?? record.size ?? record.bytes
  );
  const sha256 =
    safeString(record.sha256) ||
    safeString(record.fileSha256) ||
    safeString(record.file_sha256) ||
    undefined;

  if (!url && !providerMediaId && !fileName && !mimeType && !sha256) {
    return null;
  }

  const metadata: Record<string, unknown> = {};
  const width = coerceNumber(record.width);
  const height = coerceNumber(record.height);
  if (width !== null && width !== undefined) {
    metadata.width = width;
  }
  if (height !== null && height !== undefined) {
    metadata.height = height;
  }
  const directPath = safeString(record.directPath);
  if (directPath) {
    metadata.directPath = directPath;
  }
  const thumbnail = safeString(record.thumbnail) || safeString(record.thumbUrl);
  if (thumbnail) {
    metadata.thumbnail = thumbnail;
  }
  if (record.viewOnce === true) {
    metadata.viewOnce = true;
  }

  const type = mapMessageType(record.type ?? record.mediaType, true, false);

  return {
    type,
    providerMediaId,
    url,
    mimeType,
    fileName,
    fileSizeBytes: fileSize ?? undefined,
    sha256,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}

function mapStatus(
  statusValue: unknown,
  direction: WhatsappMessageDirection
): WhatsappMessageStatus {
  const numeric = typeof statusValue === "number" ? statusValue : undefined;
  if (typeof numeric === "number") {
    switch (numeric) {
      case 0:
        return direction === "inbound" ? "received" : "pending";
      case 1:
        return "sent";
      case 2:
        return "delivered";
      case 3:
      case 4:
        return "read";
      default:
        break;
    }
  }

  const text = safeString(statusValue)?.toLowerCase();
  if (!text) {
    return direction === "inbound" ? "received" : "sent";
  }

  if (text.includes("fail") || text.includes("error")) {
    return "failed";
  }
  if (text.includes("deliver")) {
    return "delivered";
  }
  if (text.includes("read") || text.includes("seen") || text.includes("view")) {
    return "read";
  }
  if (text.includes("pending") || text.includes("queue")) {
    return "pending";
  }
  if (text.includes("sent")) {
    return "sent";
  }

  return direction === "inbound" ? "received" : "sent";
}

function mapMessageType(
  typeValue: unknown,
  hasMedia: boolean,
  hasBody: boolean
): WhatsappMessageType {
  const text = safeString(typeValue)?.toLowerCase();

  if (text) {
    if (text.includes("chat") || text === "text" || text === "conversation") {
      return "text";
    }
    if (text.includes("image")) {
      return "image";
    }
    if (text.includes("video")) {
      return "video";
    }
    if (text === "ptt" || text.includes("audio")) {
      return "audio";
    }
    if (text.includes("document") || text.includes("file") || text === "application") {
      return "document";
    }
    if (text.includes("sticker")) {
      return "sticker";
    }
    if (text.includes("location")) {
      return "location";
    }
    if (text.includes("contact")) {
      return "contact";
    }
    if (text.includes("reaction") || text.includes("emoji")) {
      return "reaction";
    }
  }

  if (hasMedia) {
    return "document";
  }

  if (hasBody) {
    return "text";
  }

  return "unknown";
}

function buildRawPayload(
  context: Record<string, unknown>,
  raw: Record<string, unknown>
): Record<string, unknown> {
  const safeContextKeys = [
    "event",
    "type",
    "instanceId",
    "instance",
    "provider",
    "companyId",
    "company_id",
    "webhookType",
    "webhookEvent",
  ];

  const safeContext: Record<string, unknown> = {};

  for (const key of safeContextKeys) {
    if (context[key] !== undefined) {
      safeContext[key] = context[key];
    }
  }

  const data = context.data;
  if (data && typeof data === "object") {
    const dataRecord = data as Record<string, unknown>;
    for (const key of safeContextKeys) {
      if (dataRecord[key] !== undefined && safeContext[key] === undefined) {
        safeContext[key] = dataRecord[key];
      }
    }
  }

  return {
    context: safeContext,
    message: raw,
  };
}

function resolveCompanyId(
  context: Record<string, unknown>,
  raw: Record<string, unknown>,
  fallbackCompanyId?: number
): number | null {
  const candidates = [
    context.companyId,
    context.company_id,
    getNested(context, ["data", "companyId"]),
    getNested(context, ["data", "company_id"]),
    raw.companyId,
    raw.company_id,
    getNested(raw, ["data", "companyId"]),
    getNested(raw, ["data", "company_id"]),
    fallbackCompanyId,
  ];

  for (const candidate of candidates) {
    const parsed = coerceNumber(candidate);
    if (parsed !== null && parsed !== undefined) {
      return parsed;
    }
  }

  return null;
}

function resolveBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "1" || normalized === "true" || normalized === "yes") {
      return true;
    }
    if (normalized === "0" || normalized === "false" || normalized === "no") {
      return false;
    }
  }

  return undefined;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function safeString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : undefined;
  }

  return undefined;
}

function extractPhoneNumber(whatsappId: string): string | undefined {
  const [identifier] = whatsappId.split("@");
  const digits = identifier.replace(/[^0-9+]/g, "");
  return digits.length > 0 ? digits : undefined;
}

function parseTimestamp(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    const millis = value > 1_000_000_000_000 ? value : value * 1000;
    return new Date(millis).toISOString();
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      const millis = parsed > 1_000_000_000_000 ? parsed : parsed * 1000;
      return new Date(millis).toISOString();
    }

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return new Date().toISOString();
}

function getNested(
  source: unknown,
  path: Array<string | number>
): unknown {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  let current: unknown = source;

  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string | number, unknown>)[segment];
  }

  return current;
}

function pruneUndefined<T extends Record<string, unknown>>(record: T): T {
  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    if (value !== undefined) {
      filtered[key] = value;
    }
  }

  return filtered as T;
}

function formatPostgrestError(
  action: string,
  error: PostgrestError | null
): string {
  if (!error) {
    return action;
  }

  return `${action}: ${error.message}`;
}

async function persistNormalizedMessage(
  normalized: NormalizedWebhookMessage
): Promise<PersistResult> {
  const nowIso = new Date().toISOString();
  const extras = normalized.contact.extras;
  const contactPayload = pruneUndefined({
    company_id: normalized.companyId,
    whatsapp_id: normalized.contact.whatsappId,
    phone_number: normalized.contact.phoneNumber,
    display_name: normalized.contact.displayName,
    profile_name: normalized.contact.profileName,
    is_business: normalized.contact.isBusiness,
    extras:
      extras && Object.keys(extras).length > 0 ? extras : undefined,
    updated_at: nowIso,
  });

  const { data: contactData, error: contactError } = await supabaseadmin
    .from("whatsapp_contacts")
    .upsert(contactPayload, { onConflict: "company_id,whatsapp_id" })
    .select()
    .maybeSingle();

  const contact = (contactData ?? null) as WhatsappContactRow | null;

  if (contactError) {
    throw new Error(
      formatPostgrestError("Falha ao salvar contato", contactError)
    );
  }

  if (!contact) {
    throw new Error("Contato do WhatsApp não foi retornado pelo banco");
  }

  const conversationPayload = pruneUndefined({
    company_id: normalized.companyId,
    contact_id: contact.id,
    remote_jid: normalized.conversation.remoteJid,
    instance_id: normalized.conversation.instanceId,
    status: normalized.conversation.status,
    last_message_at: normalized.message.occurredAt,
    updated_at: nowIso,
  });

  const { data: conversationData, error: conversationError } = await supabaseadmin
    .from("whatsapp_conversations")
    .upsert(conversationPayload, { onConflict: "company_id,contact_id" })
    .select()
    .maybeSingle();

  const conversation = (conversationData ?? null) as
    | WhatsappConversationRow
    | null;

  if (conversationError) {
    throw new Error(
      formatPostgrestError("Falha ao salvar conversa", conversationError)
    );
  }

  if (!conversation) {
    throw new Error("Conversa do WhatsApp não foi retornada pelo banco");
  }

  const messagePayload = pruneUndefined({
    company_id: normalized.companyId,
    conversation_id: conversation.id,
    contact_id: contact.id,
    evolution_message_id: normalized.message.evolutionMessageId,
    direction: normalized.message.direction,
    message_type: normalized.message.type,
    status: normalized.message.status,
    body: normalized.message.body,
    caption: normalized.message.caption,
    remote_jid: normalized.conversation.remoteJid,
    instance_id: normalized.conversation.instanceId,
    occurred_at: normalized.message.occurredAt,
    raw_payload: normalized.message.rawPayload,
    updated_at: nowIso,
  });

  const { data: messageData, error: messageError } = await supabaseadmin
    .from("whatsapp_messages")
    .upsert(messagePayload, { onConflict: "evolution_message_id" })
    .select()
    .maybeSingle();

  const message = (messageData ?? null) as WhatsappMessageRow | null;

  if (messageError) {
    throw new Error(
      formatPostgrestError("Falha ao salvar mensagem", messageError)
    );
  }

  if (!message) {
    throw new Error("Mensagem não foi retornada pelo banco");
  }

  const queueAttachments: PersistResult["queueAttachments"] = [];

  if (normalized.message.media.length > 0) {
    const mediaRows = normalized.message.media.map((media, index) => {
      const storedId =
        media.providerMediaId ??
        `${normalized.message.evolutionMessageId}:${index}`;
      const metadata = { ...(media.metadata ?? {}) };

      if (media.providerMediaId) {
        metadata.originalProviderMediaId = media.providerMediaId;
      } else {
        metadata.fallbackProviderMediaId = storedId;
      }

      queueAttachments.push(
        pruneUndefined({
          providerMediaId: storedId,
          originalProviderMediaId: media.providerMediaId,
          url: media.url,
          mimeType: media.mimeType,
          fileName: media.fileName,
          sha256: media.sha256,
        })
      );

      return pruneUndefined({
        message_id: message.id,
        company_id: normalized.companyId,
        media_type: media.type,
        provider_media_id: storedId,
        mime_type: media.mimeType,
        file_name: media.fileName,
        file_size_bytes: media.fileSizeBytes,
        url: media.url,
        sha256: media.sha256,
        metadata:
          Object.keys(metadata).length > 0 ? metadata : undefined,
      });
    });

    if (mediaRows.length > 0) {
      const { error: mediaError } = await supabaseadmin
        .from("whatsapp_message_media")
        .upsert(mediaRows, { onConflict: "message_id,provider_media_id" });

      if (mediaError) {
        throw new Error(
          formatPostgrestError("Falha ao salvar mídias", mediaError)
        );
      }
    }
  }

  return { contact, conversation, message, queueAttachments };
}

export async function POST(req: NextRequest) {
  const secret = process.env.EVOLUTION_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[evolution-webhook] Variável EVOLUTION_WEBHOOK_SECRET ausente");
    return NextResponse.json(
      { error: "Webhook da Evolution não configurado" },
      { status: 500 }
    );
  }

  const signature = req.headers.get(SIGNATURE_HEADER);

  if (!signature || signature !== secret) {
    return NextResponse.json(
      { error: "Assinatura inválida" },
      { status: 401 }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("[evolution-webhook] Falha ao ler JSON", error);
    return NextResponse.json(
      { error: "Payload inválido" },
      { status: 400 }
    );
  }

  const fallbackCompanyId = parseCompanyHeader(req.headers.get(COMPANY_HEADER));
  const normalizedMessages = normalizePayload(payload, fallbackCompanyId);

  if (normalizedMessages.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, results: [] });
  }

  const hasRedis = Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);
  const results: Array<Record<string, unknown>> = [];

  for (const normalized of normalizedMessages) {
    try {
      const persisted = await persistNormalizedMessage(normalized);

      if (hasRedis && persisted.queueAttachments.length > 0) {
        try {
          await enqueue(
            EVOLUTION_MEDIA_QUEUE,
            JSON.stringify({
              companyId: normalized.companyId,
              messageId: persisted.message.id,
              conversationId: persisted.conversation.id,
              attachments: persisted.queueAttachments,
            })
          );
        } catch (queueError) {
          console.error(
            "[evolution-webhook] Falha ao enfileirar mídias",
            queueError
          );
        }
      }

      results.push({
        evolutionMessageId: normalized.message.evolutionMessageId,
        messageId: persisted.message.id,
      });
    } catch (error) {
      console.error(
        "[evolution-webhook] Erro ao persistir mensagem",
        normalized.message.evolutionMessageId,
        error
      );

      results.push({
        evolutionMessageId: normalized.message.evolutionMessageId,
        error: (error as Error).message,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
  });
}

export function GET() {
  return NextResponse.json({ error: "Método não permitido" }, { status: 405 });
}

