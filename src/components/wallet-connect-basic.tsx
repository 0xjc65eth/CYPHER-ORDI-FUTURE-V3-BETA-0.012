'use client'

import { useState } from 'react'
import { useLaserEyes } from '@omnisat/lasereyes-react'
import { UNISAT } from '@omnisat/lasereyes-core'

export function WalletConnectBasic() {
  const { connect, disconnect, connected, address } = useLaserEyes()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await connect(UNISAT)
      setIsConnecting(false)
    } catch (error) {
      console.error('Error connecting wallet:', error)
      setIsConnecting(false)
    }
  }

  return (
    <div>
      {connected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button 
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  )
}
