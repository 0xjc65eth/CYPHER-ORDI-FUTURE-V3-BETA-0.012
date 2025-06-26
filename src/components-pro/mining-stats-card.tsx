'use client'

import { DashboardCard } from '@/components/dashboard-card'
import { useOrdiscanData } from '@/hooks/useOrdiscanData'

export function MiningStatsCard() {
  const { data: miningData } = useOrdiscanData('/mining')

  return (
    <DashboardCard title="Mining Stats">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Hash Rate</p>
          <p className="text-2xl font-bold">{miningData?.hash_rate || '0'} EH/s</p>
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