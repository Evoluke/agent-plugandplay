// src/app/dashboard/layout.client.tsx
'use client'
import React, { ReactNode, useEffect, useState } from 'react'
import { Sidebar } from '@/components/ui/sidebar'
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#FAFAFA] p-6 h-full overflow-auto">
        {children}
      </main>
    </div>
  )
}
