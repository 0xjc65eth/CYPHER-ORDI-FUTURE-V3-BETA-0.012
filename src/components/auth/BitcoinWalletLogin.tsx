'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BitcoinWallet {
  id: string;
  name: string;
  icon: string;
  isInstalled: () => boolean;
  connect: () => Promise<WalletConnection>;
}

interface WalletConnection {
  address: string;
  publicKey: string;
  signature?: string;
  walletType: string;
}

// Bitcoin wallet configurations
const BITCOIN_WALLETS: BitcoinWallet[] = [
  {
    id: 'xverse',
    name: 'Xverse',
    icon: '/wallets/xverse.svg',
    isInstalled: () => typeof window !== 'undefined' && !!(window as any).XverseProviders,
    connect: async () => {
      const xverse = (window as any).XverseProviders.getProvider();
      const response = await xverse.connect();
      
      // Sign a message for authentication
      const message = `Sign in to CYPHER ORDI FUTURE\nTimestamp: ${Date.now()}`;
      const signedMessage = await xverse.signMessage({
        address: response.addresses.payment,
        message
      });
      
      return {
        address: response.addresses.payment,
        publicKey: response.publicKey,
        signature: signedMessage.signature,
        walletType: 'xverse'
      };
    }
  },
  {
    id: 'unisat',
    name: 'UniSat',
    icon: '/wallets/unisat.svg',
    isInstalled: () => typeof window !== 'undefined' && !!(window as any).unisat,
    connect: async () => {
      const unisat = (window as any).unisat;
      const accounts = await unisat.requestAccounts();
      const publicKey = await unisat.getPublicKey();
      
      // Sign a message for authentication
      const message = `Sign in to CYPHER ORDI FUTURE\nTimestamp: ${Date.now()}`;
      const signature = await unisat.signMessage(message);
      
      return {
        address: accounts[0],
        publicKey,
        signature,
        walletType: 'unisat'
      };
    }
  },
  {
    id: 'oyl',
    name: 'OYL',
    icon: '/wallets/oyl.svg',
    isInstalled: () => typeof window !== 'undefined' && !!(window as any).oyl,
    connect: async () => {
      const oyl = (window as any).oyl;
      const { nativeSegwit, taproot } = await oyl.getAddresses();
      
      // Sign a message for authentication
      const message = `Sign in to CYPHER ORDI FUTURE\nTimestamp: ${Date.now()}`;
      const response = await oyl.signMessage({
        address: nativeSegwit.address,
        message
      });
      
      return {
        address: nativeSegwit.address,
        publicKey: nativeSegwit.publicKey,
        signature: response.signature,
        walletType: 'oyl'
      };
    }
  }
];

export function BitcoinWalletLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleWalletLogin = async (wallet: BitcoinWallet) => {
    setError(null);
    setLoading(wallet.id);

    try {
      // Check if wallet is installed
      if (!wallet.isInstalled()) {
        throw new Error(`${wallet.name} wallet is not installed`);
      }

      // Connect to wallet and get signature
      const connection = await wallet.connect();
      
      // Send authentication request to backend
      const response = await fetch('/api/auth/bitcoin-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: connection.address,
          publicKey: connection.publicKey,
          signature: connection.signature,
          walletType: connection.walletType,
          timestamp: Date.now()
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      // Store authentication token
      if (data.token) {
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('wallet-address', connection.address);
        localStorage.setItem('wallet-type', connection.walletType);
      }

      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      setError(err.message || `Failed to connect with ${wallet.name}`);
    } finally {
      setLoading(null);
    }
  };

  // Check which wallets are installed
  const installedWallets = BITCOIN_WALLETS.filter(wallet => wallet.isInstalled());
  const hasInstalledWallets = installedWallets.length > 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-800 text-gray-400">Or sign in with Bitcoin wallet</span>
        </div>
      </div>

      {!hasInstalledWallets && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-orange-400">No Bitcoin wallets detected</p>
              <p className="text-xs text-gray-400">
                Install Xverse, UniSat, or OYL wallet to sign in with your Bitcoin address
              </p>
              <div className="flex gap-2 mt-2">
                <a
                  href="https://www.xverse.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-500 hover:text-orange-400 underline"
                >
                  Get Xverse
                </a>
                <span className="text-gray-600">•</span>
                <a
                  href="https://unisat.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-500 hover:text-orange-400 underline"
                >
                  Get UniSat
                </a>
                <span className="text-gray-600">•</span>
                <a
                  href="https://oyl.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-500 hover:text-orange-400 underline"
                >
                  Get OYL
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {installedWallets.map((wallet) => (
          <Button
            key={wallet.id}
            onClick={() => handleWalletLogin(wallet)}
            disabled={loading !== null}
            variant="outline"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 border-gray-600 hover:border-orange-500/50 transition-colors"
          >
            {loading === wallet.id ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Wallet className="h-5 w-5 text-orange-500" />
            )}
            <span>Continue with {wallet.name}</span>
          </Button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}