// Função para buscar dados da API do Ordiscan
export async function fetchOrdiscanData(endpoint: string) {
  try {
    // Durante o desenvolvimento, retornar dados simulados
    if (process.env.NODE_ENV === 'development') {
      return getMockData(endpoint);
    }

    const apiKey = process.env.NEXT_PUBLIC_ORDISCAN_API_KEY;
    if (!apiKey) {
      console.warn('API key not found, using mock data');
      return getMockData(endpoint);
    }

    const response = await fetch(`https://api.ordiscan.com${endpoint}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return getMockData(endpoint);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching data from Ordiscan API:', error);
    return getMockData(endpoint);
  }
}

// Função para retornar dados simulados quando a API não estiver disponível
function getMockData(endpoint: string) {
  // Dados simulados para diferentes endpoints
  const mockData: Record<string, any> = {
    '/price': {
      price: 58000,
      change_24h: 2.5,
    },
    '/mempool': {
      pending_transactions: 25000,
      average_fee_rate: 45,
    },
    '/mining': {
      hash_rate: 350,
      difficulty: 72000000000000,
      block_time: 9.8,
    },
    '/ordinals': {
      total_inscriptions: 1500000,
      volume_24h: 150,
      floor_price: 0.05,
      popular_collections: [
        { name: 'Collection 1', volume: 50 },
        { name: 'Collection 2', volume: 30 },
        { name: 'Collection 3', volume: 20 },
      ],
    },
    '/runes': {
      volume_24h: 75,
      active_runes: [
        { name: 'Rune 1', volume: 30 },
        { name: 'Rune 2', volume: 25 },
        { name: 'Rune 3', volume: 20 },
      ],
    },
  };

  return mockData[endpoint] || {};
} 