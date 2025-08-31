// src/lib/notifications.ts
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

export async function createNotification(companyId: number, message: string, type: NotificationType = 'info') {
  return supabaseadmin
    .from('notifications')
    .insert({ company_id: companyId, message, type })
    .select()
    .single();
}

export async function getNotifications(companyId: number) {
  return supabaseadmin
    .from('notifications')
    .select('*')
    .eq('company_id', companyId)
    .order('read_at', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false })
    .limit(4);
}

export async function markAsRead(id: string, companyId: number) {
  return supabaseadmin
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', companyId);
}
