'use client'

import { DashboardCard } from '@/components/dashboard-card'
import { useOrdiscanData } from '@/hooks/useOrdiscanData'
import { useState, useEffect } from 'react'

export function MiningStatsCard() {
  const [mounted, setMounted] = useState(false)
  const { data: miningData } = useOrdiscanData('/mining')

  // Evitar hidratação usando useEffect para renderizar apenas no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <DashboardCard title="Mining Stats">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Hash Rate</p>
          <p className="text-2xl font-bold">
            {mounted
              ? (miningData?.hash_rate || '0')
              : "234.5" /* Valor fixo para SSR */
            } EH/s
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Difficulty</p>
          <p className="text-2xl font-bold">{miningData?.difficulty?.toLocaleString() || '0'} T</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Block Time</p>
          <p className="text-2xl font-bold">{miningData?.block_time || '0'} min</p>
        </div>
      </div>
    </DashboardCard>
  )
}