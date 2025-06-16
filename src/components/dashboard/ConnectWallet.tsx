'use client';

import React, { useState } from 'react';
import { Wallet, Shield, ExternalLink, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useWallet, WALLET_NAMES, WalletName } from '@/contexts/WalletContext';

// Wallet configuration
const WALLET_CONFIG = {
  [WALLET_NAMES.UNISAT]: {
    name: 'UniSat',
    description: 'The most popular Bitcoin wallet for DeFi',
    icon: '🟡',
    downloadUrl: 'https://unisat.io/',
    features: ['Bitcoin & Ordinals', 'DeFi Ready', 'Mobile Support'],
    recommended: true
  },
  [WALLET_NAMES.XVERSE]: {
    name: 'Xverse',
    description: 'Advanced Bitcoin wallet with stacking',
    icon: '🔮',
    downloadUrl: 'https://www.xverse.app/',
    features: ['Bitcoin & STX', 'NFT Support', 'Stacking'],
    recommended: false
  },
  [WALLET_NAMES.OYL]: {
    name: 'OYL',
    description: 'Professional trading wallet',
    icon: '⚡',
    downloadUrl: 'https://oyl.io/',
    features: ['Professional Tools', 'Advanced Trading', 'Portfolio Analytics'],
    recommended: false
  },
  [WALLET_NAMES.MAGIC_EDEN]: {
    name: 'Magic Eden',
    description: 'NFT marketplace wallet',
    icon: '🎨',
    downloadUrl: 'https://magiceden.io/wallet',
    features: ['NFT Trading', 'Marketplace Integration', 'Creator Tools'],
    recommended: false
  }
} as const;

interface WalletCardProps {
  walletName: WalletName;
  isConnecting: boolean;
  onConnect: (walletName: WalletName) => void;
}

const WalletCard: React.FC<WalletCardProps> = ({ walletName, isConnecting, onConnect }) => {
  const config = WALLET_CONFIG[walletName];
  
  return (
    <div className={`relative p-6 bg-gray-800 rounded-xl border transition-all duration-300 hover:bg-gray-750 hover:border-orange-500/50 ${
      config.recommended ? 'border-orange-500/30 bg-gradient-to-br from-gray-800 to-orange-900/10' : 'border-gray-700'
    }`}>
      
      {/* Recommended Badge */}
      {config.recommended && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Recommended
        </div>
      )}
      
      {/* Wallet Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">{config.name}</h3>
            <p className="text-sm text-gray-400">{config.description}</p>
          </div>
        </div>
        
        <a 
          href={config.downloadUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-orange-400 transition-colors"
          title="Download wallet"
        >
          <ExternalLink size={16} />
        </a>
      </div>
      
      {/* Features */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {config.features.map((feature, index) => (
            <span 
              key={index}
              className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
      
      {/* Connect Button */}
      <button
        onClick={() => onConnect(walletName)}
        disabled={isConnecting}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
          config.recommended 
            ? 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-orange-500/50' 
            : 'bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-700/50'
        }`}
      >
        {isConnecting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet size={16} />
            <span>Connect {config.name}</span>
          </>
        )}
      </button>
    </div>
  );
};

const ConnectWallet: React.FC = () => {
  const { isConnected, isConnecting, address, walletType, connect, disconnect, error } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<WalletName | null>(null);

  const handleConnect = async (walletName: WalletName) => {
    setSelectedWallet(walletName);
    const success = await connect(walletName);
    if (!success) {
      setSelectedWallet(null);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setSelectedWallet(null);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // If wallet is connected, show connected state
  if (isConnected && address && walletType) {
    const connectedWalletConfig = WALLET_CONFIG[walletType];
    
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        
        {/* Connected Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full">
              <Check className="text-green-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Wallet Connected</h3>
              <p className="text-sm text-gray-400">
                {connectedWalletConfig.name} • {formatAddress(address)}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          >
            Disconnect
          </button>
        </div>

        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="text-green-400" size={16} />
              <span className="text-sm font-medium text-white">Security</span>
            </div>
            <p className="text-xs text-gray-400">Connection secured via wallet extension</p>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="text-blue-400" size={16} />
              <span className="text-sm font-medium text-white">Provider</span>
            </div>
            <p className="text-xs text-gray-400">{connectedWalletConfig.name} Wallet</p>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium text-white">Status</span>
            </div>
            <p className="text-xs text-gray-400">Connected & Active</p>
          </div>
        </div>
      </div>
    );
  }

  // Show wallet selection interface
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full border border-gray-700 mx-auto">
          <Wallet className="text-orange-500" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Choose your preferred Bitcoin wallet to access your portfolio and start trading
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-red-400 flex-shrink-0" size={16} />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Wallet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(WALLET_CONFIG).map(([walletKey, config]) => (
          <WalletCard
            key={walletKey}
            walletName={walletKey as WalletName}
            isConnecting={isConnecting && selectedWallet === walletKey}
            onConnect={handleConnect}
          />
        ))}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
          <div>
            <h4 className="text-blue-300 font-medium text-sm mb-1">Security Notice</h4>
            <p className="text-blue-200/80 text-xs leading-relaxed">
              We never store your private keys. All transactions are signed securely in your wallet. 
              Make sure you're connecting to the official Cypher Ordi Future platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;