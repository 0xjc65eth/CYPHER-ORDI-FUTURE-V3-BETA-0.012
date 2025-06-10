'use client'

/**
 * Hook seguro para usar wallet sem lançar erro
 * Retorna valores padrão quando WalletProvider não está disponível
 */
export function useWalletSafe() {
  // Fallback padrão - para ser usado quando WalletProvider não está disponível
  return {
    isConnected: false,
    isConnecting: false,
    address: undefined,
    ordinalsAddress: undefined,
    paymentAddress: undefined,
    publicKey: undefined,
    balance: undefined,
    network: undefined,
    connect: async (walletName: string) => {
      console.warn('WalletProvider not available')
    },
    disconnect: async () => {
      console.warn('WalletProvider not available')
    },
    signMessage: async (message: string) => {
      console.warn('WalletProvider not available')
      return ''
    },
    sendBTC: async (to: string, amount: number) => {
      console.warn('WalletProvider not available')
      return ''
    },
    sendOrdinals: async (to: string, inscriptionId: string) => {
      console.warn('WalletProvider not available')
      return ''
    },
    getInscriptions: async () => {
      console.warn('WalletProvider not available')
      return []
    },
    error: undefined
  }
}