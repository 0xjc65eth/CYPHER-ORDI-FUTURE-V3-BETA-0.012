'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  LogOut, 
  ChevronDown,
  Bitcoin,
  Coins,
  Globe,
  Shield,
  Zap,
  QrCode,
  Check,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';

// Wallet interfaces
interface WalletInfo {
  type: string;
  name: string;
  address: string;
  network: string;
  balance: number;
  balanceUSD: number;
  icon: string;
  connected: boolean;
}

interface WalletProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  networks: string[];
  detect: () => boolean;
  connect: () => Promise<WalletInfo>;
}

// Wallet providers configuration
const WALLET_PROVIDERS: WalletProvider[] = [
  // Bitcoin wallets
  {
    id: 'unisat',
    name: 'Unisat',
    icon: <Bitcoin className="w-5 h-5" />,
    networks: ['bitcoin'],
    detect: () => typeof window !== 'undefined' && !!(window as any).unisat,
    connect: async () => {
      const unisat = (window as any).unisat;
      if (!unisat) throw new Error('Unisat not installed');
      
      const accounts = await unisat.requestAccounts();
      const balance = await unisat.getBalance();
      const network = await unisat.getNetwork();
      
      return {
        type: 'unisat',
        name: 'Unisat Wallet',
        address: accounts[0],
        network: network,
        balance: balance.confirmed / 1e8,
        balanceUSD: (balance.confirmed / 1e8) * 104500, // Mock price
        icon: '🟠',
        connected: true
      };
    }
  },
  {
    id: 'xverse',
    name: 'Xverse',
    icon: <Shield className="w-5 h-5" />,
    networks: ['bitcoin'],
    detect: () => typeof window !== 'undefined' && !!(window as any).BitcoinProvider,
    connect: async () => {
      const provider = (window as any).BitcoinProvider;
      if (!provider) throw new Error('Xverse not installed');
      
      const response = await provider.request('getAccounts');
      const address = response.result[0].address;
      
      return {
        type: 'xverse',
        name: 'Xverse Wallet',
        address: address,
        network: 'bitcoin',
        balance: 0, // Will fetch from API
        balanceUSD: 0,
        icon: '🔷',
        connected: true
      };
    }
  },
  {
    id: 'leather',
    name: 'Leather (Hiro)',
    icon: <Wallet className="w-5 h-5" />,
    networks: ['bitcoin', 'stacks'],
    detect: () => typeof window !== 'undefined' && !!(window as any).LeatherProvider,
    connect: async () => {
      const provider = (window as any).LeatherProvider;
      if (!provider) throw new Error('Leather not installed');
      
      const response = await provider.request('getAddresses');
      const btcAddress = response.result.addresses.find((a: any) => a.type === 'p2wpkh');
      
      return {
        type: 'leather',
        name: 'Leather Wallet',
        address: btcAddress.address,
        network: 'bitcoin',
        balance: 0,
        balanceUSD: 0,
        icon: '🟣',
        connected: true
      };
    }
  },
  // EVM wallets
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: <img src="/icons/metamask.svg" className="w-5 h-5" />,
    networks: ['ethereum', 'polygon', 'bsc', 'avalanche'],
    detect: () => typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask,
    connect: async () => {
      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error('MetaMask not installed');
      
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const balance = await ethereum.request({ 
        method: 'eth_getBalance', 
        params: [accounts[0], 'latest'] 
      });
      
      return {
        type: 'metamask',
        name: 'MetaMask',
        address: accounts[0],
        network: 'ethereum',
        balance: parseInt(balance, 16) / 1e18,
        balanceUSD: (parseInt(balance, 16) / 1e18) * 2285, // Mock ETH price
        icon: '🦊',
        connected: true
      };
    }
  },
  // Solana wallets
  {
    id: 'phantom',
    name: 'Phantom',
    icon: <img src="/icons/phantom.svg" className="w-5 h-5" />,
    networks: ['solana'],
    detect: () => typeof window !== 'undefined' && !!(window as any).solana?.isPhantom,
    connect: async () => {
      const phantom = (window as any).solana;
      if (!phantom) throw new Error('Phantom not installed');
      
      const response = await phantom.connect();
      const publicKey = response.publicKey.toString();
      
      return {
        type: 'phantom',
        name: 'Phantom Wallet',
        address: publicKey,
        network: 'solana',
        balance: 0, // Will fetch from API
        balanceUSD: 0,
        icon: '👻',
        connected: true
      };
    }
  }
];

export function EnhancedWalletConnect() {
  const [isOpen, setIsOpen] = useState(false);
  const [connectedWallets, setConnectedWallets] = useState<WalletInfo[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState('all');

  // Load connected wallets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('connectedWallets');
    if (saved) {
      const wallets = JSON.parse(saved);
      setConnectedWallets(wallets);
      if (wallets.length > 0) {
        setSelectedWallet(wallets[0]);
      }
    }
  }, []);

  // Save wallets to localStorage
  useEffect(() => {
    if (connectedWallets.length > 0) {
      localStorage.setItem('connectedWallets', JSON.stringify(connectedWallets));
    }
  }, [connectedWallets]);

  // Detect available wallets
  const detectWallets = useCallback(() => {
    return WALLET_PROVIDERS.filter(provider => provider.detect());
  }, []);

  // Connect wallet
  const connectWallet = async (provider: WalletProvider) => {
    setIsConnecting(true);
    try {
      const wallet = await provider.connect();
      
      // Fetch real balance
      await updateWalletBalance(wallet);
      
      // Add to connected wallets
      setConnectedWallets(prev => {
        const exists = prev.find(w => w.address === wallet.address);
        if (exists) return prev;
        return [...prev, wallet];
      });
      
      setSelectedWallet(wallet);
      setIsOpen(false);
      
      // Play success sound
      playSound('success');
      
      toast.success(`${wallet.name} conectada com sucesso!`, {
        icon: '✅',
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333'
        }
      });
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast.error(error.message || 'Erro ao conectar wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Update wallet balance
  const updateWalletBalance = async (wallet: WalletInfo) => {
    try {
      // Implement real balance fetching based on wallet type
      switch (wallet.network) {
        case 'bitcoin':
          // Fetch BTC balance from mempool.space or similar
          break;
        case 'ethereum':
          // Fetch ETH balance from etherscan or web3
          break;
        case 'solana':
          // Fetch SOL balance from solana RPC
          break;
      }
    } catch (error) {
      console.error('Balance update error:', error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = (address: string) => {
    setConnectedWallets(prev => prev.filter(w => w.address !== address));
    if (selectedWallet?.address === address) {
      setSelectedWallet(connectedWallets[0] || null);
    }
    
    toast.success('Wallet desconectada');
  };

  // Copy address
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Endereço copiado!');
  };

  // Generate QR code
  const generateQR = async (address: string) => {
    try {
      const qr = await QRCode.toDataURL(address, {
        width: 256,
        margin: 2,
        color: {
          dark: '#FFFFFF',
          light: '#000000'
        }
      });
      setQrCode(qr);
      setShowQR(true);
    } catch (error) {
      console.error('QR generation error:', error);
    }
  };

  // Play sound effect
  const playSound = (type: string) => {
    const audio = new Audio(`/sounds/${type}.mp3`);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  // Main button render
  const renderMainButton = () => {
    if (!selectedWallet) {
      return (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-500/25"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">{selectedWallet.network}</span>
          </div>
          <div className="border-l border-gray-700 pl-3">
            <p className="text-sm font-medium text-white">
              {selectedWallet.address.slice(0, 6)}...{selectedWallet.address.slice(-4)}
            </p>
            <p className="text-xs text-gray-400">
              {selectedWallet.balance.toFixed(4)} {selectedWallet.network === 'bitcoin' ? 'BTC' : 
                selectedWallet.network === 'ethereum' ? 'ETH' : 'SOL'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="ml-2"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderMainButton()}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-xl border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Wallet Manager
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeNetwork} onValueChange={setActiveNetwork} className="mt-6">
            <TabsList className="grid grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
              <TabsTrigger value="evm">EVM</TabsTrigger>
              <TabsTrigger value="solana">Solana</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {/* Connected wallets */}
              {connectedWallets.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-400">Connected Wallets</h3>
                  {connectedWallets.map((wallet) => (
                    <motion.div
                      key={wallet.address}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-lg">{wallet.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{wallet.name}</p>
                          <p className="text-sm text-gray-400">
                            {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-white">
                            {wallet.balance.toFixed(4)} {wallet.network === 'bitcoin' ? 'BTC' : 'ETH'}
                          </p>
                          <p className="text-sm text-gray-400">
                            ${wallet.balanceUSD.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyAddress(wallet.address)}
                            className="h-8 w-8"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => generateQR(wallet.address)}
                            className="h-8 w-8"
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => disconnectWallet(wallet.address)}
                            className="h-8 w-8 text-red-400 hover:text-red-300"
                          >
                            <LogOut className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Available wallets */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400">Available Wallets</h3>
                <div className="grid grid-cols-2 gap-3">
                  {detectWallets().map((provider) => (
                    <Button
                      key={provider.id}
                      onClick={() => connectWallet(provider)}
                      disabled={isConnecting || connectedWallets.some(w => w.type === provider.id)}
                      className="h-auto p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 justify-start"
                    >
                      {isConnecting ? (
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mr-3">
                          {provider.icon}
                        </div>
                      )}
                      <div className="text-left">
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-xs text-gray-400">
                          {provider.networks.join(', ')}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Install prompt */}
              <div className="mt-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-300">
                      Don\'t see your wallet?
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Make sure your wallet extension is installed and unlocked. 
                      Refresh the page if you just installed it.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Network-specific tabs would show filtered wallets */}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-sm bg-gray-900/95 backdrop-blur-xl border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-4">Wallet QR Code</h3>
            {qrCode && (
              <img src={qrCode} alt="QR Code" className="mx-auto mb-4" />
            )}
            <p className="text-sm text-gray-400">
              Scan this QR code to send funds to this wallet
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}