'use client'

import { useState, useEffect } from 'react'
import { useLaserEyes } from '@omnisat/lasereyes-react'
import { UNISAT, XVERSE, MAGIC_EDEN, OYL } from '@omnisat/lasereyes-core'
import { RiWallet3Line, RiCloseLine, RiLoader4Line } from 'react-icons/ri'

export function WalletConnectSimple() {
  const {
    connect,
    disconnect,
    connected,
    connecting,
    address
  } = useLaserEyes()

  const [showModal, setShowModal] = useState(false)

  // Função para conectar carteira
  const handleConnect = async (walletId: string) => {
    try {
      let provider;

      switch (walletId) {
        case 'unisat':
          provider = UNISAT;
          break;
        case 'xverse':
          provider = XVERSE;
          break;
        case 'magic-eden':
          provider = MAGIC_EDEN;
          break;
        case 'oyl':
          provider = OYL;
          break;
        default:
          provider = UNISAT;
      }

      console.log(`Connecting to ${walletId} wallet...`);
      await connect(provider);
      console.log('Connection successful');
      setShowModal(false);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert(`Failed to connect wallet. Please make sure your wallet is installed and try again.`);
    }
  }

  // Função para desconectar carteira
  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }

  // Renderizar o botão de conexão ou o endereço da carteira
  return (
    <div className="relative z-50">
      {connected && address ? (
        <div className="flex items-center">
          <button
            onClick={handleDisconnect}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white rounded-md shadow-lg hover:from-[#7C4DEF] hover:to-[#5253E8] transition-all"
          >
            <span className="truncate max-w-[150px] font-medium">{address.slice(0, 6)}...{address.slice(-4)}</span>
            <RiCloseLine className="ml-2 w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white rounded-md shadow-lg hover:from-[#7C4DEF] hover:to-[#5253E8] transition-all"
            disabled={connecting}
          >
            {connecting ? (
              <>
                <RiLoader4Line className="animate-spin mr-2 w-5 h-5" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <RiWallet3Line className="mr-2 w-5 h-5" />
                <span>Connect Wallet</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Modal de seleção de carteira */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#121212] border border-[#3D3D3D] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-4">
              <button
                onClick={() => handleConnect('unisat')}
                className="w-full flex items-center p-4 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-md transition-all"
              >
                <span className="text-white font-medium">UniSat</span>
              </button>

              <button
                onClick={() => handleConnect('xverse')}
                className="w-full flex items-center p-4 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-md transition-all"
              >
                <span className="text-white font-medium">Xverse</span>
              </button>

              <button
                onClick={() => handleConnect('magic-eden')}
                className="w-full flex items-center p-4 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-md transition-all"
              >
                <span className="text-white font-medium">Magic Eden</span>
              </button>

              <button
                onClick={() => handleConnect('oyl')}
                className="w-full flex items-center p-4 bg-[#2D2D2D] hover:bg-[#3D3D3D] rounded-md transition-all"
              >
                <span className="text-white font-medium">OYL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
