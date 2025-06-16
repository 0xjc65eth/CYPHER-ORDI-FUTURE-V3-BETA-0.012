import { useQuery } from '@tanstack/react-query'

export function useRunesList() {
  return useQuery({
    queryKey: ['runes-list'],
    queryFn: async () => {
      try {
        console.log('Fetching Runes list from API...')

        // Fetch data from API
        const response = await fetch('/api/runes-list')
        if (!response.ok) {
          throw new Error(`Failed to fetch Runes list: ${response.status}`)
        }

        const data = await response.json()
        console.log('Runes list data:', data.slice(0, 3))

        return data
      } catch (error) {
        console.error('Error fetching Runes list:', error)

        // Return fallback data
        const fallbackData = [
          {
            name: 'ORDI',
            formatted_name: 'ORDI',
            volume_24h: 280,
            market: {
              price_in_btc: 0.000085
            },
            unique_holders: 2800
          },
          {
            name: 'SATS',
            formatted_name: 'SATS',
            volume_24h: 210,
            market: {
              price_in_btc: 0.000065
            },
            unique_holders: 2100
          },
          {
            name: 'PEPE',
            formatted_name: 'PEPE',
            volume_24h: 180,
            market: {
              price_in_btc: 0.000045
            },
            unique_holders: 1800
          },
          {
            name: 'MEME',
            formatted_name: 'MEME',
            volume_24h: 150,
            market: {
              price_in_btc: 0.000035
            },
            unique_holders: 1500
          },
          {
            name: 'DOGE',
            formatted_name: 'DOGE',
            volume_24h: 120,
            market: {
              price_in_btc: 0.000025
            },
            unique_holders: 1200
          }
        ]

        return fallbackData
      }
    },
    refetchInterval: 60000, // 1 minute
    staleTime: 30000, // 30 seconds
  })
}
