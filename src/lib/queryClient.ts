import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Evita re-fetch no lado do servidor que pode causar hidratação
      staleTime: 60 * 1000, // 1 minuto
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      // Só refetch no cliente após hidratação
      refetchOnReconnect: 'always',
      retry: (failureCount, error) => {
        // Não retry em erros de hydratação
        if (error && typeof error === 'object' && 'message' in error) {
          if ((error.message as string).includes('hydrat')) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  },
});

// Singleton para uso consistente
let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: sempre criar novo cliente
    return createQueryClient();
  } else {
    // Browser: usar singleton ou criar
    if (!browserQueryClient) {
      browserQueryClient = createQueryClient();
    }
    return browserQueryClient;
  }
};