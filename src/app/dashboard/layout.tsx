// src/app/dashboard/layout.client.tsx
'use client'
import React, { ReactNode, useEffect, useState } from 'react'
import { Sidebar, MobileSidebar } from '@/components/ui/sidebar'
import DashboardAlerts from '@/components/ui/dashboard-alerts'
import NotificationBell from '@/components/notifications/NotificationBell'
import { supabasebrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Props { children: ReactNode }

export default function DashboardClientLayout({ children }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabasebrowser.auth.getUser().then(async ({ data, error }) => {
      if (error || !data?.user) {
        router.replace('/login')
        return
      }
      const { data: company } = await supabasebrowser
        .from('company')
        .select('profile_complete')
        .eq('user_id', data.user.id)
        .single()
      if (!company?.profile_complete) {
        router.replace('/complete-profile')
        return
      }
      setLoading(false)
    })
  }, [router])

  if (loading) return <div className="min-h-[100svh] flex items-center justify-center">Carregando...</div>

  return (
    <div className="flex min-h-[100svh]">
        <Sidebar className="hidden sm:flex" />
        <main className="flex-1 bg-[#FAFAFA] p-6 h-full overflow-auto">
          <div className="flex w-full items-center mb-4">
            <MobileSidebar />
            <div className="ml-auto">
              <NotificationBell />
            </div>
          </div>
          <DashboardAlerts />
          {children}
        </main>
      </div>
    )
  }
