'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabasebrowser } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  message: string;
  type: string;
  read_at: string | null;
  created_at: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const sortAndLimit = (list: Notification[]) =>
    [...list]
      .sort((a, b) => {
        if (!a.read_at && b.read_at) return -1;
        if (a.read_at && !b.read_at) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 4);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    const setup = async () => {
      const { data: { user } } = await supabasebrowser.auth.getUser();
      if (!user) return;
      const { data: company } = await supabasebrowser
        .from('company')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!company) return;
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(sortAndLimit(data));
      }
      channel = supabasebrowser
        .channel(`notifications:company:${company.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `company_id=eq.${company.id}`,
          },
          (payload) => {
            const newNotif = payload.new as Notification;
            setNotifications((prev) => sortAndLimit([newNotif, ...prev]));
            toast(newNotif.message);
          }
        )
        .subscribe();
    };
    setup();
    return () => {
      if (channel) supabasebrowser.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      sortAndLimit(
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      )
    );
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
