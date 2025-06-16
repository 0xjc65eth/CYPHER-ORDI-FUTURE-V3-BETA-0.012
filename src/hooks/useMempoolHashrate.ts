import { useQuery } from '@tanstack/react-query'

export function useMempoolHashrate() {
  return useQuery({
    queryKey: ['mempool-hashrate'],
    queryFn: async () => {
      const res = await fetch('https://mempool.space/api/v1/mining/hashrate/3d')
      return res.json()
    },
    refetchInterval: 60000, // 1 minuto
  })
} 