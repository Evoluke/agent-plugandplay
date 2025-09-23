import { supabaseadmin } from "@/lib/supabaseAdmin";

export const SUPPORTED_EVOLUTION_EVENTS = [
  "QRCODE_UPDATED",
  "MESSAGES_UPSERT",
  "MESSAGES_UPDATE",
  "MESSAGES_DELETE",
  "SEND_MESSAGE",
  "CONNECTION_UPDATE",
] as const;

export type EvolutionEventType = (typeof SUPPORTED_EVOLUTION_EVENTS)[number];

type MessageDeliveryStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

type MessageContentType =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "document"
  | "sticker"
  | "location"
  | "template"
  | "unknown";

type JsonRecord = Record<string, unknown>;

interface InstanceContext {
  id: string;
  companyId: number;
  settings: Record<string, unknown> | null;
}

interface ProcessContext {
  instance: InstanceContext;
}

interface NormalizedMessage {
  externalId: string;
  remoteJid: string;
  conversationExternalId: string;
  fromMe: boolean;
  direction: "inbound" | "outbound";
  senderType: "contact" | "agent" | "automation" | "system";
  timestamp: Date;
  text?: string;
  contentType: MessageContentType;
  mediaUrl?: string;
  mediaCaption?: string;
  status: MessageDeliveryStatus;
  externalStatus?: string;
  contactName?: string;
  contactNumber?: string;
  contactProfileUrl?: string;
  quotedExternalId?: string;
  raw: Record<string, unknown>;
}

interface NormalizedMessageUpdate {
  externalId: string;
  status?: MessageDeliveryStatus;
  externalStatus?: string;
  deliveredAt?: Date;
  readAt?: Date;
  errorReason?: string;
}

interface NormalizedMessageDeletion {
  externalId: string;
  reason?: string;
  hardDelete: boolean;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getEvolutionEventType(
  payload: Record<string, unknown>,
): EvolutionEventType | null {
  const candidates = [
    payload.event,
    payload.type,
    payload.action,
    payload.eventName,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") {
      continue;
    }

    const normalized = candidate
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_");

    if (
      SUPPORTED_EVOLUTION_EVENTS.includes(
        normalized as EvolutionEventType,
      )
    ) {
      return normalized as EvolutionEventType;
    }
  }

  return null;
}

export async function processEvolutionWebhook(
  payload: Record<string, unknown>,
  context: ProcessContext,
  explicitEventType?: EvolutionEventType,
): Promise<void> {
  const eventType = explicitEventType ?? getEvolutionEventType(payload);

  if (!eventType) {
    throw new Error("Tipo de evento da Evolution API não reconhecido.");
  }

  switch (eventType) {
    case "MESSAGES_UPSERT":
    case "SEND_MESSAGE":
      await handleMessagesEvent(payload, context, eventType === "SEND_MESSAGE");
      return;
    case "MESSAGES_UPDATE":
      await handleMessageUpdates(payload, context);
      return;
    case "MESSAGES_DELETE":
      await handleMessageDeletions(payload, context);
      return;
    case "QRCODE_UPDATED":
      await handleQrCodeUpdated(payload, context);
      return;
    case "CONNECTION_UPDATE":
      await handleConnectionUpdate(payload, context);
      return;
    default:
      throw new Error(`Evento Evolution não suportado: ${eventType}`);
  }
}

async function handleMessagesEvent(
  payload: Record<string, unknown>,
  context: ProcessContext,
  forceOutbound: boolean,
) {
  const messages = extractMessagesFromPayload(payload, forceOutbound);

  if (!messages.length) {
    return;
  }

  for (const message of messages) {
    await processSingleMessage(message, context);
  }
}

async function processSingleMessage(
  message: NormalizedMessage,
  context: ProcessContext,
) {
  const { instance } = context;
  const companyId = instance.companyId;
  const instanceId = instance.id;

  const contactId = await ensureContact({
    companyId,
    instanceId,
    externalId: message.remoteJid,
    name: message.contactName,
    number: message.contactNumber,
    profileImageUrl: message.contactProfileUrl,
  });

  const conversationId = await ensureConversation({
    companyId,
    instanceId,
    contactId,
    externalId: message.conversationExternalId,
    lastMessageAt: message.timestamp,
  });

  const payload = sanitizeForJson(message.raw);
  const messageRecord: Record<string, unknown> = {
    company_id: companyId,
    instance_id: instanceId,
    conversation_id: conversationId,
    contact_id: contactId,
    direction: message.direction,
    sender_type: message.senderType,
    status: message.status,
    content_type: message.contentType,
    text: message.text ?? null,
    media_url: message.mediaUrl ?? null,
    media_caption: message.mediaCaption ?? null,
    payload,
    external_id: message.externalId,
    external_status: message.externalStatus ?? null,
    sent_at: message.timestamp.toISOString(),
  };

  if (message.direction === "inbound") {
    messageRecord.delivered_at = message.timestamp.toISOString();
  }

  if (message.quotedExternalId) {
    const replyTo = await findMessageIdByExternalId(
      companyId,
      message.quotedExternalId,
    );
    messageRecord.reply_to_message_id = replyTo;
  }

  const { error } = await supabaseadmin
    .from("messages_chat")
    .upsert(messageRecord, {
      onConflict: "company_id,external_id",
      ignoreDuplicates: false,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Falha ao salvar mensagem do webhook: ${error.message}`);
  }

  await supabaseadmin
    .from("conversations")
    .update({
      last_message_at: message.timestamp.toISOString(),
      status: "open",
    })
    .eq("id", conversationId);
}

function extractMessagesFromPayload(
  payload: Record<string, unknown>,
  forceOutbound: boolean,
): NormalizedMessage[] {
  const candidates = collectArrayCandidates(payload, "messages");
  const normalized: NormalizedMessage[] = [];

  for (const raw of candidates) {
    const message = normalizeMessage(raw, { forceOutbound });
    if (message) {
      normalized.push(message);
    }
  }

  return normalized;
}

function collectArrayCandidates(
  payload: Record<string, unknown>,
  defaultKey: string,
): unknown[] {
  const candidates: unknown[] = [];

  const direct = payload[defaultKey];
  if (Array.isArray(direct)) {
    candidates.push(...direct);
  }

  if (isRecord(direct)) {
    candidates.push(direct);
  }

  const data = payload.data;
  if (Array.isArray(data)) {
    candidates.push(...data);
  }

  if (isRecord(data)) {
    const fromData = data[defaultKey];
    if (Array.isArray(fromData)) {
      candidates.push(...fromData);
    } else if (isRecord(fromData)) {
      candidates.push(fromData);
    }

    const singleMessage = data.message;
    if (Array.isArray(singleMessage)) {
      candidates.push(...singleMessage);
    } else if (isRecord(singleMessage)) {
      candidates.push(singleMessage);
    }
  }

  if (!candidates.length && isRecord(payload.message)) {
    candidates.push(payload.message);
  }

  return candidates;
}

function normalizeMessage(
  raw: unknown,
  options: { forceOutbound: boolean },
): NormalizedMessage | null {
  if (!isRecord(raw)) {
    return null;
  }

  const rawData = raw as JsonRecord;
  const key = isRecord(rawData.key)
    ? (rawData.key as JsonRecord)
    : {};
  const externalId = firstString([
    rawData.externalId,
    rawData.id,
    rawData.messageId,
    key.id,
    key._serialized,
  ]);

  if (!externalId) {
    return null;
  }

  const remoteJid = firstString([
    rawData.remoteJid,
    rawData.chatId,
    rawData.to,
    rawData.from,
    key.remoteJid,
  ]);

  if (!remoteJid) {
    return null;
  }

  const conversationExternalId =
    firstString([
      rawData.conversationId,
      rawData.chatId,
      key.remoteJid,
      rawData.remoteJid,
    ]) ?? remoteJid;

  const fromMeValue = resolveBoolean(
    key.fromMe,
    rawData.fromMe,
    options.forceOutbound,
  );

  const fromMe = fromMeValue ?? false;
  const direction = fromMe ? "outbound" : "inbound";
  const senderType = fromMe ? "agent" : "contact";

  const timestamp = resolveDate([
    rawData.timestamp,
    rawData.createdAt,
    rawData.messageTimestamp,
    (isRecord(rawData.message) ? (rawData.message as JsonRecord).timestamp : undefined),
    rawData.date,
  ]);

  const messageNode: JsonRecord = isRecord(rawData.message)
    ? (rawData.message as JsonRecord)
    : {};

  const text = extractText(rawData, messageNode);
  const { url: mediaUrl, caption: mediaCaption } = extractMedia(messageNode);

  const ack = rawData.status ?? rawData.ack ?? key.status;
  const status = mapAckToStatus(ack) ?? (fromMe ? "sent" : "delivered");
  const externalStatus = ack !== undefined ? String(ack) : undefined;

  const contactName = firstString([
    rawData.contactName,
    rawData.pushName,
    rawData.senderName,
    getNestedString(rawData.sender, "pushName"),
    getNestedString(rawData.sender, "name"),
    getNestedString(rawData.contact, "pushName"),
    getNestedString(rawData.contact, "name"),
    getNestedString(rawData.message, "pushName"),
  ]);

  const contactProfileUrl = firstString([
    rawData.profilePicUrl,
    getNestedString(rawData.sender, "profilePicUrl"),
    getNestedString(rawData.contact, "profilePicUrl"),
  ]);

  const quotedExternalId = firstString([
    rawData.quotedMsgId,
    getNestedString(rawData.quotedMsg, "_serialized"),
    getNestedString(rawData.quotedMsg, "id"),
    getNestedString(rawData.contextInfo, "stanzaId"),
    getNestedString(rawData.context, "id"),
    getNestedString(
      getNestedRecord(messageNode.extendedTextMessage, "contextInfo"),
      "stanzaId",
    ),
  ]);

  const contentType = detectContentType(raw, messageNode);

  const sanitizedPayload = sanitizeForJson(raw);

  return {
    externalId,
    remoteJid,
    conversationExternalId,
    fromMe,
    direction,
    senderType,
    timestamp,
    text: text ?? undefined,
    contentType,
    mediaUrl: mediaUrl ?? undefined,
    mediaCaption: mediaCaption ?? undefined,
    status,
    externalStatus,
    contactName: contactName ?? undefined,
    contactNumber: extractPhone(remoteJid),
    contactProfileUrl: contactProfileUrl ?? undefined,
    quotedExternalId: quotedExternalId ?? undefined,
    raw: sanitizedPayload,
  };
}

function extractText(raw: JsonRecord, messageNode: JsonRecord): string | undefined {
  const templateMessage = getNestedRecord(messageNode, "templateMessage");
  const hydratedTemplate = getNestedRecord(templateMessage, "hydratedTemplate");
  const extendedText = getNestedRecord(messageNode, "extendedTextMessage");
  const buttonsMessage = getNestedRecord(messageNode, "buttonsMessage");
  const listMessage = getNestedRecord(messageNode, "listMessage");
  const documentMessage = getNestedRecord(messageNode, "documentMessage");

  const textCandidates = [
    raw.text,
    raw.body,
    raw.messageText,
    getNestedString(messageNode, "conversation"),
    getNestedString(messageNode, "caption"),
    getNestedString(hydratedTemplate, "hydratedContentText"),
    getNestedString(extendedText, "text"),
    getNestedString(buttonsMessage, "contentText"),
    getNestedString(listMessage, "description"),
    getNestedString(documentMessage, "caption"),
  ];

  for (const candidate of textCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return undefined;
}

function extractMedia(
  messageNode: JsonRecord,
): { url?: string; caption?: string } {
  const mediaNodes = [
    messageNode.imageMessage,
    messageNode.videoMessage,
    messageNode.audioMessage,
    messageNode.documentMessage,
    messageNode.stickerMessage,
    messageNode.locationMessage,
  ];

  for (const node of mediaNodes) {
    if (!isRecord(node)) {
      continue;
    }

    const url = firstString([
      node.url,
      node.directPath,
      node.streamableUrl,
      node.mediaKey,
    ]);

    const caption = firstString([node.caption, node.title]);

    if (url) {
      return { url, caption: caption ?? undefined };
    }
  }

  return {};
}

function detectContentType(
  raw: JsonRecord,
  messageNode: JsonRecord,
): MessageContentType {
  const viewOnceMessage = getNestedRecord(messageNode, "viewOnceMessage");
  const viewOnceInner = getNestedRecord(viewOnceMessage, "message");

  const messageType = firstString([
    raw.messageType,
    raw.type,
    getNestedString(messageNode, "messageType"),
    getNestedString(viewOnceInner, "messageType"),
  ])?.toLowerCase();

  if (messageType) {
    if (messageType.includes("image")) {
      return "image";
    }
    if (messageType.includes("audio")) {
      return "audio";
    }
    if (messageType.includes("video")) {
      return "video";
    }
    if (messageType.includes("document")) {
      return "document";
    }
    if (messageType.includes("sticker")) {
      return "sticker";
    }
    if (messageType.includes("location")) {
      return "location";
    }
    if (messageType.includes("template")) {
      return "template";
    }
  }

  if (isRecord(messageNode.imageMessage)) {
    return "image";
  }
  if (isRecord(messageNode.videoMessage)) {
    return "video";
  }
  if (isRecord(messageNode.audioMessage)) {
    return "audio";
  }
  if (isRecord(messageNode.documentMessage)) {
    return "document";
  }
  if (isRecord(messageNode.stickerMessage)) {
    return "sticker";
  }
  if (isRecord(messageNode.locationMessage)) {
    return "location";
  }
  if (
    isRecord(messageNode.templateMessage) ||
    isRecord(messageNode.buttonsMessage) ||
    isRecord(messageNode.listMessage)
  ) {
    return "template";
  }

  return "text";
}

function resolveBoolean(
  ...values: Array<unknown>
): boolean | undefined {
  for (const value of values) {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return value !== 0;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes"].includes(normalized)) {
        return true;
      }
      if (["false", "0", "no"].includes(normalized)) {
        return false;
      }
    }
  }

  return undefined;
}

function resolveDate(values: Array<unknown>): Date {
  for (const value of values) {
    const parsed = toDate(value);
    if (parsed) {
      return parsed;
    }
  }

  return new Date();
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      return null;
    }

    if (value > 1e12) {
      return new Date(value);
    }

    return new Date(value * 1000);
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return toDate(numeric);
    }

    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

function firstString(values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}

function getNestedRecord(
  source: unknown,
  key: string,
): JsonRecord | undefined {
  if (!isRecord(source)) {
    return undefined;
  }

  const value = (source as JsonRecord)[key];
  return isRecord(value) ? (value as JsonRecord) : undefined;
}

function getNestedString(source: unknown, key: string): string | undefined {
  if (!isRecord(source)) {
    return undefined;
  }

  const value = (source as JsonRecord)[key];

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function extractPhone(remoteJid: string): string | undefined {
  const match = remoteJid.match(/^(\d+)/);
  return match?.[1];
}

function sanitizeForJson<T>(value: T): Record<string, unknown> {
  return sanitizeUnknown(value) as Record<string, unknown>;
}

function sanitizeUnknown(value: unknown): unknown {
  if (value === null) {
    return null;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeUnknown(item))
      .filter((item) => item !== undefined);
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      const sanitized = sanitizeUnknown(entry);
      if (sanitized !== undefined) {
        result[key] = sanitized;
      }
    }
    return result;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return undefined;
}

async function ensureContact(params: {
  companyId: number;
  instanceId: string;
  externalId: string;
  name?: string;
  number?: string;
  profileImageUrl?: string;
}): Promise<string> {
  const contactRecord: Record<string, unknown> = {
    company_id: params.companyId,
    instance_id: params.instanceId,
    external_id: params.externalId,
    metadata: { remote_jid: params.externalId },
  };

  if (params.name) {
    contactRecord.display_name = params.name;
    contactRecord.full_name = params.name;
  }

  if (params.number) {
    contactRecord.phone = params.number;
  }

  if (params.profileImageUrl) {
    contactRecord.profile_image_url = params.profileImageUrl;
  }

  const { data, error } = await supabaseadmin
    .from("contacts")
    .upsert(contactRecord, {
      onConflict: "company_id,external_id",
      ignoreDuplicates: false,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Falha ao salvar contato: ${error.message}`);
  }

  return data.id as string;
}

async function ensureConversation(params: {
  companyId: number;
  instanceId: string;
  contactId: string;
  externalId: string;
  lastMessageAt: Date;
}): Promise<string> {
  const { data: existing, error: fetchError } = await supabaseadmin
    .from("conversations")
    .select("id, status")
    .eq("company_id", params.companyId)
    .eq("external_id", params.externalId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Falha ao consultar conversa: ${fetchError.message}`);
  }

  if (existing?.id) {
    if (existing.status === "closed") {
      await supabaseadmin
        .from("conversations")
        .update({ status: "open" })
        .eq("id", existing.id);
    }

    return existing.id as string;
  }

  const conversationRecord: Record<string, unknown> = {
    company_id: params.companyId,
    instance_id: params.instanceId,
    contact_id: params.contactId,
    external_id: params.externalId,
    channel: "whatsapp",
    status: "open",
    last_message_at: params.lastMessageAt.toISOString(),
    metadata: { remote_jid: params.externalId },
  };

  const { data, error } = await supabaseadmin
    .from("conversations")
    .insert(conversationRecord)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Falha ao criar conversa: ${error.message}`);
  }

  return data.id as string;
}

async function findMessageIdByExternalId(
  companyId: number,
  externalId: string,
): Promise<string | null> {
  const { data, error } = await supabaseadmin
    .from("messages_chat")
    .select("id")
    .eq("company_id", companyId)
    .eq("external_id", externalId)
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao buscar referência de mensagem: ${error.message}`);
  }

  return (data?.id as string) ?? null;
}

async function handleMessageUpdates(
  payload: Record<string, unknown>,
  context: ProcessContext,
) {
  const updates = extractMessageUpdates(payload);

  for (const update of updates) {
    const patch: Record<string, unknown> = {};

    if (update.status) {
      patch.status = update.status;
    }
    if (update.externalStatus) {
      patch.external_status = update.externalStatus;
    }
    if (update.deliveredAt) {
      patch.delivered_at = update.deliveredAt.toISOString();
    }
    if (update.readAt) {
      patch.read_at = update.readAt.toISOString();
    }
    if (update.errorReason) {
      patch.error_reason = update.errorReason;
      if (!update.status) {
        patch.status = "failed" satisfies MessageDeliveryStatus;
      }
    }

    if (!Object.keys(patch).length) {
      continue;
    }

    const { error } = await supabaseadmin
      .from("messages_chat")
      .update(patch)
      .eq("company_id", context.instance.companyId)
      .eq("external_id", update.externalId);

    if (error) {
      throw new Error(
        `Falha ao atualizar status da mensagem ${update.externalId}: ${error.message}`,
      );
    }
  }
}

function extractMessageUpdates(
  payload: Record<string, unknown>,
): NormalizedMessageUpdate[] {
  const candidates = collectArrayCandidates(payload, "statuses");
  const normalized: NormalizedMessageUpdate[] = [];

  for (const raw of candidates) {
    const update = normalizeMessageUpdate(raw);
    if (update) {
      normalized.push(update);
    }
  }

  return normalized;
}

function normalizeMessageUpdate(raw: unknown): NormalizedMessageUpdate | null {
  if (!isRecord(raw)) {
    return null;
  }

  const key = isRecord(raw.key) ? raw.key : {};
  const externalId = firstString([
    raw.externalId,
    raw.id,
    raw.messageId,
    key.id,
    key._serialized,
  ]);

  if (!externalId) {
    return null;
  }

  const ack = raw.status ?? raw.ack ?? raw.updateStatus;
  const status = mapAckToStatus(ack);
  const externalStatus = ack !== undefined ? String(ack) : undefined;

  const deliveredAt = resolveOptionalDate([
    raw.deliveredAt,
    raw.deliveryTimestamp,
    raw.updatedAt,
  ]);

  const readAt = resolveOptionalDate([
    raw.readAt,
    raw.readTimestamp,
    raw.seenAt,
    raw.playedAt,
  ]);

  const errorReason = firstString([raw.error, raw.reason, raw.description]);

  return {
    externalId,
    status: status ?? undefined,
    externalStatus,
    deliveredAt,
    readAt,
    errorReason: errorReason ?? undefined,
  };
}

function resolveOptionalDate(values: Array<unknown>): Date | undefined {
  for (const value of values) {
    const parsed = toDate(value);
    if (parsed) {
      return parsed;
    }
  }

  return undefined;
}

async function handleMessageDeletions(
  payload: Record<string, unknown>,
  context: ProcessContext,
) {
  const deletions = extractMessageDeletions(payload);

  for (const deletion of deletions) {
    const patch: Record<string, unknown> = {
      status: "failed",
      external_status: deletion.reason ?? "deleted",
      error_reason: deletion.hardDelete
        ? "deleted_by_user"
        : "deleted_by_provider",
    } satisfies Record<string, unknown>;

    const { error } = await supabaseadmin
      .from("messages_chat")
      .update(patch)
      .eq("company_id", context.instance.companyId)
      .eq("external_id", deletion.externalId);

    if (error) {
      throw new Error(
        `Falha ao marcar mensagem removida ${deletion.externalId}: ${error.message}`,
      );
    }
  }
}

function extractMessageDeletions(
  payload: Record<string, unknown>,
): NormalizedMessageDeletion[] {
  const candidates = collectArrayCandidates(payload, "keys");
  const normalized: NormalizedMessageDeletion[] = [];

  for (const raw of candidates) {
    const deletion = normalizeMessageDeletion(raw);
    if (deletion) {
      normalized.push(deletion);
    }
  }

  return normalized;
}

function normalizeMessageDeletion(
  raw: unknown,
): NormalizedMessageDeletion | null {
  if (!isRecord(raw)) {
    return null;
  }

  const key = isRecord(raw.key) ? raw.key : {};
  const externalId = firstString([
    raw.externalId,
    raw.id,
    raw.messageId,
    key.id,
    key._serialized,
  ]);

  if (!externalId) {
    return null;
  }

  const hardDelete = Boolean(
    resolveBoolean(raw.permanent, raw.hard, raw.isRevoke, raw.isRevoked),
  );

  const reason = firstString([raw.reason, raw.status, raw.type]);

  return {
    externalId,
    hardDelete,
    reason: reason ?? undefined,
  };
}

async function handleQrCodeUpdated(
  payload: Record<string, unknown>,
  context: ProcessContext,
) {
  const data = extractNestedRecord(payload, "data");
  const qrCode = firstString([
    data?.qrcode,
    data?.qrCode,
    data?.qr_code,
  ]);
  const status = firstString([data?.status, data?.state]);
  const expiresAt = resolveOptionalDate([
    data?.expiresAt,
    data?.expireAt,
    data?.expiration,
  ]);
  const message = firstString([data?.message, data?.description]);

  const existingSettings = cloneRecord(context.instance.settings);
  const qrSettings = isRecord(existingSettings.qrCode)
    ? { ...existingSettings.qrCode }
    : {};

  const nextSettings = {
    ...existingSettings,
    qrCode: {
      ...qrSettings,
      value: qrCode ?? null,
      status: status ?? qrSettings.status ?? null,
      expiresAt: expiresAt ? expiresAt.toISOString() : qrSettings.expiresAt ?? null,
      message: message ?? qrSettings.message ?? null,
      updatedAt: new Date().toISOString(),
    },
  } satisfies Record<string, unknown>;

  const { error } = await supabaseadmin
    .from("instance")
    .update({
      settings: nextSettings,
      last_sync_at: new Date().toISOString(),
    })
    .eq("id", context.instance.id);

  if (error) {
    throw new Error(`Falha ao atualizar QR Code da instância: ${error.message}`);
  }
}

async function handleConnectionUpdate(
  payload: Record<string, unknown>,
  context: ProcessContext,
) {
  const data = extractNestedRecord(payload, "data");
  const state = firstString([data?.state, data?.status]);
  const subStatus = firstString([data?.subStatus, data?.substatus]);
  const reason = firstString([data?.reason, data?.message]);

  const existingSettings = cloneRecord(context.instance.settings);
  const connectionSettings = isRecord(existingSettings.connection)
    ? { ...existingSettings.connection }
    : {};

  const nextSettings = {
    ...existingSettings,
    connection: {
      ...connectionSettings,
      state: state ?? connectionSettings.state ?? null,
      subStatus: subStatus ?? connectionSettings.subStatus ?? null,
      reason: reason ?? connectionSettings.reason ?? null,
      updatedAt: new Date().toISOString(),
    },
  } satisfies Record<string, unknown>;

  const connectionIsActive =
    (state?.toLowerCase() ?? "") === "open" ||
    (state?.toLowerCase() ?? "") === "connected" ||
    (subStatus?.toLowerCase() ?? "") === "connected";

  const { error } = await supabaseadmin
    .from("instance")
    .update({
      is_active: connectionIsActive ?? true,
      settings: nextSettings,
      last_sync_at: new Date().toISOString(),
    })
    .eq("id", context.instance.id);

  if (error) {
    throw new Error(
      `Falha ao atualizar status de conexão da instância: ${error.message}`,
    );
  }
}

function extractNestedRecord(
  payload: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined {
  const value = payload[key];
  if (isRecord(value)) {
    return value;
  }
  return undefined;
}

function mapAckToStatus(value: unknown): MessageDeliveryStatus | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "number") {
    if (value <= 0) {
      return "pending";
    }
    if (value === 1) {
      return "sent";
    }
    if (value === 2) {
      return "delivered";
    }
    if (value >= 3) {
      return "read";
    }
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }

    if (["0", "pending", "queue", "queued"].includes(normalized)) {
      return "pending";
    }
    if (["1", "sent", "server"].includes(normalized)) {
      return "sent";
    }
    if (["2", "delivered"].includes(normalized)) {
      return "delivered";
    }
    if (["3", "4", "read", "played", "seen"].includes(normalized)) {
      return "read";
    }
    if (["failed", "error", "5", "-1"].includes(normalized)) {
      return "failed";
    }
  }

  return undefined;
}

function cloneRecord(
  value: Record<string, unknown> | null,
): Record<string, unknown> {
  if (!isRecord(value)) {
    return {};
  }

  return { ...value };
}
