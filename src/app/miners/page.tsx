'use client'

import { TopNavLayout } from '@/components/layout/TopNavLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOrdiscanData } from '@/hooks/useOrdiscanData'
import { useMempoolHashrate } from '@/hooks/useMempoolHashrate'
import { useMempoolDifficulty } from '@/hooks/useMempoolDifficulty'
import { useMempoolPools } from '@/hooks/useMempoolPools'
import { useMempoolBlocks } from '@/hooks/useMempoolBlocks'

export default function MinersPage() {
  const { data: hashrateData, isLoading: isHashrateLoading } = useMempoolHashrate()
  const { data: difficultyData, isLoading: isDifficultyLoading } = useMempoolDifficulty()
  const { data: poolsData, isLoading: isPoolsLoading } = useMempoolPools()
  const { data: blocksData, isLoading: isBlocksLoading } = useMempoolBlocks()

  // Cálculo de descentralização (exemplo: % do maior pool)
  const decentralization = poolsData && poolsData.length > 0 ? 100 - poolsData[0].share : 0

  return (
    <TopNavLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#8B5CF6] text-transparent bg-clip-text">
            MINERS & NETWORK HEALTH
          </h1>
          <h2 className="text-lg text-muted-foreground mb-6">
            Dados em tempo real da mineração Bitcoin
          </h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <HashrateCard data={hashrateData} loading={isHashrateLoading} />
          <DifficultyCard data={difficultyData} loading={isDifficultyLoading} />
          <PoolsCard data={poolsData} loading={isPoolsLoading} />
          <DecentralizationCard decentralization={decentralization} />
        </div>

        <RecentBlocksCard data={blocksData} loading={isBlocksLoading} />
      </div>
    </TopNavLayout>
  )
}

function HashrateCard({ data, loading }: { data: any; loading: boolean }) {
  return (
    <Card className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white border-none">
      <CardHeader>
        <CardTitle className="text-white">Hashrate da Rede</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading || !Array.isArray(data) || data.length === 0
            ? 'Carregando...'
            : `${(data[data.length - 1].avgHashrate / 1e18).toLocaleString('en-US', { maximumFractionDigits: 2 })} EH/s`}
        </div>
      </CardContent>
    </Card>
  )
}
function DifficultyCard({ data, loading }: { data: any; loading: boolean }) {
  return (
    <Card className="bg-gradient-to-br from-[#f59e42] to-[#fbbf24] text-white border-none">
      <CardHeader>
        <CardTitle className="text-white">Dificuldade Atual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading || !data ? 'Carregando...' : `${(data/1e12).toLocaleString('en-US', { maximumFractionDigits: 2 })} T`}
        </div>
      </CardContent>
    </Card>
  )
}

function PoolsCard({ data, loading }: { data: any; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mining Pools</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="space-y-2">
            {data?.slice(0, 3).map((pool: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span>{pool.name || 'Unknown'}</span>
                <span>{pool.share ? pool.share.toFixed(1) : '0.0'}%</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DecentralizationCard({ decentralization }: { decentralization: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Descentralização</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{decentralization.toFixed(1)}%</div>
        <p className="text-sm text-muted-foreground mt-2">
          Nível de distribuição da rede
        </p>
      </CardContent>
    </Card>
  )
}

function RecentBlocksCard({ data, loading }: { data: any; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Blocos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="space-y-2">
            {data?.slice(0, 5).map((block: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>#{block.height}</span>
                <span>{block.poolName || 'Unknown'}</span>
                <span>{(block.reward / 1e8).toFixed(2)} BTC</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}