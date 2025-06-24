import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Hook para dados de um Rune específico
export function useRuneInfo(runeName: string | null) {
  const { data, error, mutate } = useSWR(
    () => runeName ? `/api/runes/${runeName}` : null,
    fetcher,
    {
      refreshInterval: 10000, // Revalida a cada 10 segundos
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Evita chamadas duplicadas por 5s
      errorRetryCount: 3,
      errorRetryInterval: 2000
    }
  );

  return {
    data: data?.data || null,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}

// Hook para lista de Runes
export function useRunesList() {
  const { data, error, mutate } = useSWR(
    '/api/runes/list',
    fetcher,
    {
      refreshInterval: 30000, // Lista atualiza menos frequentemente
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000
    }
  );

  return {
    runes: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}

// Hook para dados de mercado em tempo real
export function useMarketData() {
  const { data, error, mutate } = useSWR(
    '/api/market/overview',
    fetcher,
    {
      refreshInterval: 5000, // Dados de mercado atualizados rapidamente
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000
    }
  );

  return {
    marketData: data?.data || null,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}

// Hook para holders de um Rune
export function useRuneHolders(runeName: string | null, limit = 10) {
  const { data, error, mutate } = useSWR(
    () => runeName ? `/api/runes/${runeName}/holders?limit=${limit}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: false, // Holders não mudam tão frequentemente
      dedupingInterval: 15000
    }
  );

  return {
    holders: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}

// Hook para atividade/transações de um Rune
export function useRuneActivity(runeName: string | null, limit = 20) {
  const { data, error, mutate } = useSWR(
    () => runeName ? `/api/runes/${runeName}/activity?limit=${limit}` : null,
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
      dedupingInterval: 5000
    }
  );

  return {
    activity: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}

// Hook combinado para dashboard principal
export function useRunesDashboard(selectedRune?: string) {
  const runeInfo = useRuneInfo(selectedRune || null);
  const runesList = useRunesList();
  const marketData = useMarketData();
  const holders = useRuneHolders(selectedRune || null, 5);
  const activity = useRuneActivity(selectedRune || null, 10);

  return {
    selectedRune: runeInfo,
    allRunes: runesList,
    market: marketData,
    holders,
    activity,
    isLoading: runeInfo.isLoading || runesList.isLoading || marketData.isLoading,
    hasError: runeInfo.isError || runesList.isError || marketData.isError
  };
}