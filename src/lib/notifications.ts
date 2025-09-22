// src/lib/notifications.ts
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import { cacheDelete, cacheGetJson, cacheSetJson } from '@/lib/redis';
import { supabaseadmin } from '@/lib/supabaseAdmin';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  company_id: number;
  message: string;
  type: string;
  read_at: string | null;
  created_at: string;
}

const NOTIFICATIONS_CACHE_TTL_SECONDS = 60;

const notificationCacheKey = (companyId: number) =>
  `company:${companyId}:notifications`;

async function invalidateNotificationCache(companyId: number) {
  await cacheDelete(notificationCacheKey(companyId));
}

export async function createNotification(
  companyId: number,
  message: string,
  type: NotificationType = 'info'
): Promise<PostgrestSingleResponse<Notification>> {
  const response = await supabaseadmin
    .from('notifications')
    .insert({ company_id: companyId, message, type })
    .select()
    .single();

  if (!response.error) {
    await invalidateNotificationCache(companyId);
  }

  return response;
}

export async function getNotifications(
  companyId: number
): Promise<PostgrestResponse<Notification>> {
  const cacheKey = notificationCacheKey(companyId);
  const cached = await cacheGetJson<Notification[]>(cacheKey);

  if (cached) {
    return {
      data: cached,
      error: null,
      count: cached.length,
      status: 200,
      statusText: 'OK',
    };
  }

  const response = await supabaseadmin
    .from('notifications')
    .select('*')
    .eq('company_id', companyId)
    .order('read_at', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false })
    .limit(4);

  if (!response.error && response.data) {
    await cacheSetJson(cacheKey, response.data, NOTIFICATIONS_CACHE_TTL_SECONDS);
  }

  return response;
}

export async function markAsRead(id: string, companyId: number) {
  const response = await supabaseadmin
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', companyId);

  if (!response.error) {
    await invalidateNotificationCache(companyId);
  }

  return response;
}
