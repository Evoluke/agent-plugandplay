'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, Check } from 'lucide-react';
import { useNotifications } from './NotificationProvider';
import { cn } from '@/components/ui/utils';

export default function NotificationBell() {
  const { notifications, markAsRead } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs',
                'text-white'
              )}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 w-72 bg-white rounded-md shadow p-2"
        >
          {notifications.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">Sem notificações</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn('p-2 text-sm rounded flex justify-between gap-2', !n.read_at ? 'font-semibold' : 'text-gray-500')}
              >
                <span className="flex-1">{n.message}</span>
                {!n.read_at && (
                  <button
                    type="button"
                    onClick={() => markAsRead(n.id)}
                    className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700"
                    aria-label="Marcar notificação como lida"
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Marcar notificação como lida</span>
                  </button>
                )}
              </div>
            ))
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

