'use client'

import { useState, useEffect } from 'react'
import { RiLockLine, RiShieldCheckLine } from 'react-icons/ri'
import { useLaserEyes } from '@omnisat/lasereyes-react'

interface PremiumContentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PremiumContent({ children, fallback }: PremiumContentProps) {
  const { connected, address } = useLaserEyes()
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simular verificação de premium para demonstração
  useEffect(() => {
    if (connected && address) {
      // Para fins de demonstração, vamos simular que o usuário é premium
      // Em produção, você deve verificar se o usuário possui NFTs das coleções premium
      const checkPremiumStatus = () => {
        console.log('Verificando status premium...');
        // Simular um atraso na verificação
        setTimeout(() => {
          setIsPremium(true);
          setIsLoading(false);
          console.log('Status premium verificado: true');
        }, 1000);
      };

      checkPremiumStatus();
    } else {
      setIsPremium(false);
      setIsLoading(false);
    }
  }, [connected, address]);

  // Default fallback content if none provided
  const defaultFallback = (
    <div className="p-6 border border-[#3D3D3D] rounded-lg bg-[#121212] text-center">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-[#2D2D2D] rounded-full flex items-center justify-center">
          <RiLockLine className="w-6 h-6 text-[#8B5CF6]" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Premium Content Locked</h3>
      <p className="text-gray-400 text-sm mb-4">
        Connect your wallet and verify ownership of premium collections to access this content.
      </p>
    </div>
  )

  if (isLoading) {
    return (
      <div className="p-6 border border-[#3D3D3D] rounded-lg bg-[#121212] text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-[#2D2D2D] rounded-full flex items-center justify-center animate-pulse">
            <RiLockLine className="w-6 h-6 text-[#8B5CF6]" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Verificando acesso...</h3>
        <p className="text-gray-400 text-sm mb-4">
          Verificando se você possui coleções premium...
        </p>
      </div>
    )
  }

  if (!isPremium) {
    return fallback || defaultFallback
  }

  return (
    <div className="premium-content relative border border-[#8B5CF6]/30 rounded-lg">
      <div className="premium-badge absolute top-2 right-2 flex items-center px-2 py-1 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] rounded-md text-xs text-white">
        <RiShieldCheckLine className="mr-1" />
        <span>Premium</span>
      </div>
      {children}
    </div>
  )
}
