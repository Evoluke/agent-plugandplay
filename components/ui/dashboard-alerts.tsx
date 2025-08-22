'use client'

import { useEffect, useState } from 'react'
import { supabasebrowser } from '@/lib/supabaseClient'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Alert {
  id: string
  message: string
  start_date: string
  end_date: string
}

export default function DashboardAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    supabasebrowser
      .from('dashboard_alerts')
      .select('id, message, start_date, end_date')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('start_date')
      .then(({ data, error }) => {
        if (!error && data) {
          setAlerts(data)
        }
      })
  }, [])

  if (alerts.length === 0) return null

  const prev = () => setIndex((index - 1 + alerts.length) % alerts.length)
  const next = () => setIndex((index + 1) % alerts.length)

  const current = alerts[index]

  return (
    <div className="mb-4">
      <div className="relative flex items-center justify-center bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
        <p className="text-xs sm:text-sm text-yellow-800 text-center">{current.message}</p>
      </div>
      {alerts.length > 1 && (
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={prev}
            aria-label="Alerta anterior"
            className="p-1 text-yellow-700 hover:text-yellow-900"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            aria-label="Próximo alerta"
            className="p-1 text-yellow-700 hover:text-yellow-900"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
