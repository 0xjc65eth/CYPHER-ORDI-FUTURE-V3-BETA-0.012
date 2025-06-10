/**
 * 🎨 Advanced Wallet Connect Interface
 * Modern UI for multi-wallet connection
 */

'use client';

import React, { useState } from 'react';
import { Wallet, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useWallet } from './WalletProvider';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose
}) => {
  const { wallets, connectWallet, isConnecting, error } = useWallet();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-orange-500/20 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Wallet className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
              <p className="text-gray-400 text-sm">Choose your Bitcoin wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Wallet List */}
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <WalletOption
              key={wallet.id}
              wallet={wallet}
              onConnect={() => connectWallet(wallet.id)}
              isConnecting={isConnecting}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            By connecting, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

interface WalletOptionProps {
  wallet: any;
  onConnect: () => void;
  isConnecting: boolean;
}

const WalletOption: React.FC<WalletOptionProps> = ({
  wallet,
  onConnect,
  isConnecting
}) => {
  const getStatusIcon = () => {
    if (wallet.connected) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
    if (!wallet.installed) {
      return <ExternalLink className="w-5 h-5 text-gray-400" />;
    }
    return null;
  };

  const getStatusText = () => {
    if (wallet.connected) return 'Connected';
    if (!wallet.installed) return 'Install';
    return 'Connect';
  };

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting || wallet.connected}
      className={`
        w-full p-4 rounded-xl border-2 transition-all duration-200
        ${wallet.connected 
          ? 'border-green-500/30 bg-green-500/5' 
          : wallet.installed
          ? 'border-orange-500/20 bg-gray-800/50 hover:border-orange-500/40 hover:bg-gray-800/80'
          : 'border-gray-600/20 bg-gray-800/30'
        }
        ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">
              {wallet.name.slice(0, 2)}
            </span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-white">{wallet.name}</h3>
            <div className="flex space-x-2">
              {wallet.features?.slice(0, 3).map((feature: any, index: number) => (
                <span 
                  key={index}
                  className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded"
                >
                  {feature.type.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnecting ? (
            <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
          ) : (
            getStatusIcon()
          )}
          <span className={`text-sm ${
            wallet.connected ? 'text-green-400' : 
            wallet.installed ? 'text-orange-400' : 'text-gray-400'
          }`}>
            {getStatusText()}
          </span>
        </div>
      </div>
    </button>
  );
};

export default WalletConnectModal;
