// src/app/dashboard/layout.client.tsx
'use client'
import React, { ReactNode, useEffect, useState } from 'react'
import { Sidebar } from '@/components/ui/sidebar'
import { supabasebrowser } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface Props { children: ReactNode }

export default function DashboardClientLayout({ children }: Props) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabasebrowser.auth.getUser().then(({ data, error }) => {
      if (error || !data?.user) router.replace('/login')
      else setUser(data.user)
    })
  }, [router])

  if (!user) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 p-6 h-full overflow-auto">
        {children}
      </main>
    </div>
  )
}
