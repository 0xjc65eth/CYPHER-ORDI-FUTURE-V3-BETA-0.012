'use client';

import React, { useState, useEffect } from 'react';
import { useWalletManager } from '@/lib/wallet/walletManager';
import { ClientOnly } from '@/components/common/ClientOnly';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, AlertTriangle, CheckCircle, X } from 'lucide-react';

const WalletConnectorContent: React.FC = () => {
  const {
    connected,
    accounts,
    provider,
    availableProviders,
    connect,
    disconnect,
    resolveConflicts
  } = useWalletManager();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<any>(null);

  useEffect(() => {
    // Verificar conflitos ao montar
    resolveConflicts().then(setConflicts);
  }, [resolveConflicts]);

  const handleConnect = async (providerName?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await connect(providerName);
      
      if (!result.success) {
        setError(result.error || 'Failed to connect');
        
        // Se múltiplos provedores, não é erro mas sim escolha
        if (result.accounts && Array.isArray(result.accounts)) {
          setError(null);
        }
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setError(null);
  };

  // Se conectado, mostrar status
  if (connected) {
    return (
      <Card className="p-4 bg-gray-900 border-green-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-semibold text-white">
                Connected to {provider}
              </p>
              <p className="text-sm text-gray-400" suppressHydrationWarning>
                {accounts[0] ? `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}` : ''}
              </p>
            </div>
          </div>
          <Button
            onClick={handleDisconnect}
            variant="outline"
            size="sm"
            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Disconnect
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gray-900">
      <div className="space-y-4">
        <div className="text-center">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-400 text-sm">
            Choose a wallet to connect to the platform
          </p>
        </div>

        {/* Aviso de conflitos */}
        {conflicts?.hasConflicts && (
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-semibold text-sm">
                  Multiple Wallets Detected
                </p>
                <p className="text-yellow-300 text-xs mt-1">
                  {conflicts.recommendation}
                </p>
                <p className="text-yellow-300 text-xs">
                  Detected: {conflicts.providers.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de provedores */}
        {availableProviders.length > 0 ? (
          <div className="space-y-2">
            {availableProviders.map((prov) => (
              <Button
                key={prov.name}
                onClick={() => handleConnect(prov.name)}
                disabled={loading}
                className="w-full flex items-center justify-start gap-3 p-4 h-auto bg-gray-800 hover:bg-gray-700 border border-gray-700"
              >
                <span className="text-2xl">{prov.icon}</span>
                <div className="text-left">
                  <p className="font-semibold">{prov.name}</p>
                  <p className="text-xs text-gray-400">
                    {prov.name === 'MetaMask' && 'Ethereum & ERC-20'}
                    {prov.name === 'Phantom' && 'Solana & SPL'}
                    {prov.name === 'Xverse' && 'Bitcoin & Ordinals'}
                    {prov.name === 'UniSat' && 'Bitcoin & Runes'}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 mb-4">
              No wallet extensions detected
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Install one of these wallets:</p>
              <div className="flex justify-center gap-4">
                <span>🦊 MetaMask</span>
                <span>👻 Phantom</span>
                <span>🔷 Xverse</span>
                <span>🟠 UniSat</span>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-2">
            <p className="text-blue-400 text-sm">Connecting wallet...</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export const SafeWalletConnector: React.FC = () => {
  return (
    <ClientOnly
      fallback={
        <Card className="p-6 bg-gray-900">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">Loading wallet options...</div>
          </div>
        </Card>
      }
    >
      <WalletConnectorContent />
    </ClientOnly>
  );
};