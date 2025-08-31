// src/lib/notifications.ts
import { supabaseadmin } from '@/lib/supabaseAdmin';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: string;
  read_at: string | null;
  created_at: string;
}

export async function createNotification(userId: string, message: string, type: NotificationType = 'info') {
  return supabaseadmin.from('notifications').insert({ user_id: userId, message, type }).select().single();
}

export async function getNotifications(userId: string) {
  return supabaseadmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function markAsRead(id: string) {
  return supabaseadmin
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);
}
