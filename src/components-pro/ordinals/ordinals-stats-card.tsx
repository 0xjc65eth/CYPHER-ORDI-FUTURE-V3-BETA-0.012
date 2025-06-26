'use client'

import { DashboardCard } from '@/components/dashboard-card'
import { useOrdiscanData } from '@/hooks/useOrdiscanData'

export function OrdinalsStatsCard() {
  const { data: ordinalsData, isLoading, isError } = useOrdiscanData('/ordinals')

  if (isLoading) {
    return (
      <DashboardCard title="Ordinals Stats">
        <div className="space-y-4 animate-pulse">
          <div>
            <p className="text-sm text-muted-foreground">Total Inscriptions</p>
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">24h Volume</p>
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Floor Price</p>
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
        </div>
      </DashboardCard>
    )
  }

  if (isError) {
    return (
      <DashboardCard title="Ordinals Stats">
        <div className="space-y-4">
          <p className="text-sm text-destructive">Failed to load data</p>
          <p className="text-xs text-muted-foreground">Please try again later</p>
        </div>
      </DashboardCard>
    )
  }

  return (
    <DashboardCard title="Ordinals Stats">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Inscriptions</p>
          <p className="text-2xl font-bold">{ordinalsData?.total_inscriptions?.toLocaleString() || '0'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">24h Volume</p>
          <p className="text-2xl font-bold">${ordinalsData?.volume_24h?.toLocaleString() || '0'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Floor Price</p>
          <p className="text-2xl font-bold">${ordinalsData?.floor_price?.toLocaleString() || '0'}</p>
        </div>
      </div>
    </DashboardCard>
  )
} 