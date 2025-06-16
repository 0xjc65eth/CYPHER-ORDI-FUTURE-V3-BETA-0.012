'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  CheckCircle, 
  LogOut, 
  Shield,
  Bitcoin,
  Zap
} from 'lucide-react';
import { useWalletDetection } from '@/hooks';

interface QuickTradeWalletProps {
  onWalletConnect?: (address: string, network: string) => void;
  selectedNetwork?: string;
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  network: string | null;
  balance?: any;
}

export function QuickTradeWallet({ onWalletConnect, selectedNetwork }: QuickTradeWalletProps) {
  const { hasEthereum, hasSolana, connectEthereum, connectSolana } = useWalletDetection();
  
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    network: null
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Multi-chain wallet connection handlers
  const handleConnectBitcoin = async () => {
    try {
      setConnecting(true);
      
      // Try to connect to Bitcoin wallets
      if ((window as any).unisat) {
        const accounts = await (window as any).unisat.requestAccounts();
        if (accounts[0]) {
          const address = accounts[0];
          setWalletState({
            isConnected: true,
            address,
            network: 'bitcoin'
          });
          onWalletConnect?.(address, 'bitcoin');
          setIsDropdownOpen(false);
        }
      } else if ((window as any).xfi?.bitcoin) {
        const accounts = await (window as any).xfi.bitcoin.request({ method: 'request_accounts' });
        if (accounts[0]) {
          const address = accounts[0];
          setWalletState({
            isConnected: true,
            address,
            network: 'bitcoin'
          });
          onWalletConnect?.(address, 'bitcoin');
          setIsDropdownOpen(false);
        }
      } else {
        throw new Error('No Bitcoin wallet found');
      }
    } catch (error) {
      console.error('Failed to connect Bitcoin wallet:', error);
      alert('Bitcoin wallet not found. Please install Unisat or Xverse.');
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectEthereum = async () => {
    try {
      setConnecting(true);
      const address = await connectEthereum();
      if (address) {
        setWalletState({
          isConnected: true,
          address,
          network: 'ethereum'
        });
        onWalletConnect?.(address, 'ethereum');
        setIsDropdownOpen(false);
      }
    } catch (error) {
      console.error('Failed to connect Ethereum wallet:', error);
      alert('Ethereum wallet connection failed. Please install MetaMask.');
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectSolana = async () => {
    try {
      setConnecting(true);
      const address = await connectSolana();
      if (address) {
        setWalletState({
          isConnected: true,
          address,
          network: 'solana'
        });
        onWalletConnect?.(address, 'solana');
        setIsDropdownOpen(false);
      }
    } catch (error) {
      console.error('Failed to connect Solana wallet:', error);
      alert('Solana wallet connection failed. Please install Phantom.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setWalletState({
        isConnected: false,
        address: null,
        network: null
      });
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkIcon = (network: string) => {
    switch (network) {
      case 'bitcoin':
        return <span className="text-orange-500">₿</span>;
      case 'ethereum':
        return <span className="text-blue-500">⟠</span>;
      case 'solana':
        return <span className="text-purple-500">◎</span>;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'bitcoin':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'ethereum':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'solana':
        return 'bg-purple-600 hover:bg-purple-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  // Connected state
  if (walletState.isConnected && walletState.address) {
    return (
      <div className="relative">
        <Button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`${getNetworkColor(walletState.network!)} text-white`}
          size="sm"
        >
          <Shield className="w-4 h-4 mr-2" />
          {getNetworkIcon(walletState.network!)}
          <span className="ml-1">{formatAddress(walletState.address)}</span>
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </Button>

        {isDropdownOpen && (
          <Card className="absolute top-full mt-2 right-0 w-80 bg-gray-900 border-gray-700 p-4 z-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 capitalize">{walletState.network} Wallet</span>
                <Badge className="bg-green-600 text-white">Connected</Badge>
              </div>
              
              <div className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                <code className="flex-1 text-sm text-white font-mono break-all">
                  {walletState.address}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-8 w-8 p-0"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="w-full border-red-600 text-red-400 hover:bg-red-600/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect Wallet
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Not connected state
  return (
    <div className="relative">
      <Button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={connecting}
        className="bg-gradient-to-r from-orange-600 to-blue-600 hover:from-orange-700 hover:to-blue-700 text-white"
        size="sm"
      >
        <Zap className="w-4 h-4 mr-2" />
        {connecting ? 'Connecting...' : 'Connect Trading Wallet'}
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isDropdownOpen && (
        <Card className="absolute top-full mt-2 right-0 w-80 bg-gray-900 border-gray-700 p-4 z-50">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              Connect Multi-Chain Trading Wallet
            </h3>
            
            <Button
              onClick={handleConnectBitcoin}
              disabled={connecting}
              className="w-full bg-orange-600 hover:bg-orange-700 justify-start"
            >
              <span className="mr-3">₿</span>
              Bitcoin Network
              <span className="ml-auto text-xs text-orange-200">BTC, Ordinals, Runes</span>
            </Button>
            
            {hasEthereum && (
              <Button
                onClick={handleConnectEthereum}
                disabled={connecting}
                className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
              >
                <span className="mr-3">⟠</span>
                Ethereum Network
                <span className="ml-auto text-xs text-blue-200">ETH, ERC-20</span>
              </Button>
            )}
            
            {hasSolana && (
              <Button
                onClick={handleConnectSolana}
                disabled={connecting}
                className="w-full bg-purple-600 hover:bg-purple-700 justify-start"
              >
                <span className="mr-3">◎</span>
                Solana Network
                <span className="ml-auto text-xs text-purple-200">SOL, SPL Tokens</span>
              </Button>
            )}

            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400 text-center">
                Multi-chain trading • Separate from dashboard wallet
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}