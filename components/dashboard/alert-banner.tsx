'use client'

import { useEffect, useState } from 'react'
import { supabasebrowser } from '@/lib/supabaseClient'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Alert {
  id: string
  message: string
}

export default function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const fetchAlerts = async () => {
      const now = new Date().toISOString()
      const { data } = await supabasebrowser
        .from('alerts')
        .select('id,message,start_date,end_date')
        .lte('start_date', now)
        .gte('end_date', now)
        .order('start_date', { ascending: false })
      setAlerts(data || [])
    }
    fetchAlerts()
  }, [])

  if (!alerts.length) return null

  const handlePrev = () =>
    setIndex((i) => (i === 0 ? alerts.length - 1 : i - 1))
  const handleNext = () =>
    setIndex((i) => (i === alerts.length - 1 ? 0 : i + 1))

  return (
    <div className="mb-4 rounded-md bg-yellow-100 p-3 text-yellow-800">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-sm text-center sm:text-left w-full break-words">
          {alerts[index].message}
        </span>
        {alerts.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Alerta anterior"
              className="p-1 text-yellow-800 hover:text-yellow-900"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs">
              {index + 1}/{alerts.length}
            </span>
            <button
              onClick={handleNext}
              aria-label="Próximo alerta"
              className="p-1 text-yellow-800 hover:text-yellow-900"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

