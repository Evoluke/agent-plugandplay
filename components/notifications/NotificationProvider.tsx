'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabasebrowser } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import type { RealtimeChannel, Session } from '@supabase/supabase-js';

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
    let isMounted = true;
    let channel: RealtimeChannel | null = null;
    let lastCompanyId: number | null = null;
    let authSubscription:
      | ReturnType<typeof supabasebrowser.auth.onAuthStateChange>['data']['subscription']
      | null = null;

    const cleanupChannel = () => {
      if (channel) {
        supabasebrowser.removeChannel(channel);
        channel = null;
      }
    };

    const syncNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) {
          if (res.status === 401 || res.status === 404) {
            if (isMounted) setNotifications([]);
          }
          return null;
        }
        const { notifications: list, companyId } = (await res.json()) as {
          notifications: Notification[];
          companyId: number | null;
        };
        if (!isMounted) return null;
        setNotifications(sortAndLimit(list ?? []));
        return typeof companyId === 'number' ? companyId : null;
      } catch (error) {
        console.error('Failed to load notifications', error);
        return null;
      }
    };

    const handleSession = async (session: Session | null) => {
      if (!session?.user) {
        lastCompanyId = null;
        cleanupChannel();
        if (isMounted) setNotifications([]);
        return;
      }

      const companyId = await syncNotifications();
      if (companyId == null) {
        lastCompanyId = null;
        cleanupChannel();
        return;
      }
      if (companyId === lastCompanyId && channel) return;
      lastCompanyId = companyId;
      cleanupChannel();
      channel = supabasebrowser
        .channel(`notifications:company:${companyId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `company_id=eq.${companyId}`,
          },
          (payload) => {
            if (!isMounted) return;
            const newNotif = payload.new as Notification;
            setNotifications((prev) => sortAndLimit([newNotif, ...prev]));
            toast(newNotif.message);
          }
        )
        .subscribe();
    };

    supabasebrowser.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      void handleSession(session);
    });

    const { data } = supabasebrowser.auth.onAuthStateChange((_, session) => {
      void handleSession(session);
    });
    authSubscription = data.subscription;

    return () => {
      isMounted = false;
      cleanupChannel();
      if (authSubscription) authSubscription.unsubscribe();
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
