import { useQuery } from '@tanstack/react-query'

export function useMempoolBlocks() {
  return useQuery({
    queryKey: ['mempool-blocks'],
    queryFn: async () => {
      const res = await fetch('https://mempool.space/api/v1/blocks')
      return res.json()
    },
    refetchInterval: 60000, // 1 minuto
  })
} 