// Hook seguro para LaserEyes com fallback
import { useEffect, useState } from 'react'

interface LaserEyesState {
  address: string | null
  connected: boolean
  connecting: boolean
  hasUnisat: boolean
  hasXverse: boolean
  hasMagicEden: boolean
  hasOkx: boolean
  hasLeather: boolean
  hasPhantom: boolean
  publicKey: string
  paymentAddress: string
  paymentPublicKey: string
  ordinalsAddress: string
  ordinalsPublicKey: string
  network: string
  library: string | null
  provider: any
  accounts: string[]
  balance: number | undefined
}

const initialState: LaserEyesState = {
  address: null,
  connected: false,
  connecting: false,
  hasUnisat: false,
  hasXverse: false,
  hasMagicEden: false,
  hasOkx: false,
  hasLeather: false,
  hasPhantom: false,
  publicKey: '',
  paymentAddress: '',
  paymentPublicKey: '',
  ordinalsAddress: '',
  ordinalsPublicKey: '',
  network: 'mainnet',
  library: null,
  provider: null,
  accounts: [],
  balance: undefined,
}

export function useSafeLaserEyes() {
  const [state] = useState<LaserEyesState>(initialState)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const connect = async () => {
    console.log('LaserEyes connect called - fallback mode')
    return { address: null }
  }

  const disconnect = async () => {
    console.log('LaserEyes disconnect called - fallback mode')
  }

  const signPsbt = async () => {
    console.log('LaserEyes signPsbt called - fallback mode')
    return null
  }

  const pushPsbt = async () => {
    console.log('LaserEyes pushPsbt called - fallback mode')
    return null
  }

  const signMessage = async () => {
    console.log('LaserEyes signMessage called - fallback mode')
    return null
  }

  return {
    ...state,
    isClient,
    connect,
    disconnect,
    signPsbt,
    pushPsbt,
    signMessage,
  }
}
