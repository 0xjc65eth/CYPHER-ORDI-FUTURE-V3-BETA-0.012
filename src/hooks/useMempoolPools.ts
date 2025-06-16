import { useQuery } from '@tanstack/react-query'

export function useMempoolPools() {
  return useQuery({
    queryKey: ['mempool-pools'],
    queryFn: async () => {
      const res = await fetch('https://mempool.space/api/v1/mining/pools')
      return res.json()
    },
    refetchInterval: 60000, // 1 minuto
  })
} 