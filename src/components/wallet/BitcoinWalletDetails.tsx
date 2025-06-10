'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, RefreshCw, Copy, Image, Coins } from 'lucide-react';
import { useBitcoinWallet } from '@/hooks/useBitcoinWallet';
import { toast } from 'react-hot-toast';

const BitcoinWalletDetails: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { 
    walletState, 
    isConnected, 
    refreshWalletInfo,
    getFormattedBalance,
    getFormattedAddress 
  } = useBitcoinWallet();

  if (!isConnected) {
    return null;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshWalletInfo();
      toast.success('Wallet data refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh wallet data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatInscriptionId = (id: string) => {
    if (!id) return '';
    return `${id.slice(0, 8)}...${id.slice(-8)}`;
  };

  const balance = getFormattedBalance();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">🔶</span>
            Bitcoin Wallet Details
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Bitcoin Balance</p>
            <p className="text-xl font-bold text-orange-600">{balance.btc} BTC</p>
            <p className="text-xs text-gray-500">{balance.satoshis} sats</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Ordinals</p>
            <p className="text-xl font-bold text-purple-600">{walletState.ordinalsBalance?.length || 0}</p>
            <p className="text-xs text-gray-500">Digital artifacts</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Runes</p>
            <p className="text-xl font-bold text-green-600">{walletState.runesBalance?.length || 0}</p>
            <p className="text-xs text-gray-500">Fungible tokens</p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Address Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Wallet Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Wallet Type</p>
                <p className="font-medium capitalize">{walletState.walletType}</p>
              </div>
              <Badge variant="secondary">{walletState.walletType}</Badge>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-mono text-sm truncate">{walletState.address}</p>
              </div>
              <div className="flex gap-2 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(walletState.address || '')}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const explorerUrl = `https://mempool.space/address/${walletState.address}`;
                    window.open(explorerUrl, '_blank');
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Ordinals and Runes */}
        <Tabs defaultValue="ordinals" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ordinals" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Ordinals ({walletState.ordinalsBalance?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="runes" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Runes ({walletState.runesBalance?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ordinals" className="mt-4">
            {walletState.ordinalsBalance && walletState.ordinalsBalance.length > 0 ? (
              <div className="space-y-3">
                {walletState.ordinalsBalance.slice(0, 10).map((ordinal: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">
                          {ordinal.title || `Inscription #${ordinal.number || index + 1}`}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">
                          {formatInscriptionId(ordinal.id || ordinal.inscription_id || '')}
                        </p>
                        {ordinal.content_type && (
                          <Badge variant="outline" className="mt-1">
                            {ordinal.content_type}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const explorerUrl = `https://ordinals.com/inscription/${ordinal.id || ordinal.inscription_id}`;
                          window.open(explorerUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {walletState.ordinalsBalance.length > 10 && (
                  <p className="text-sm text-gray-500 text-center">
                    Showing first 10 of {walletState.ordinalsBalance.length} ordinals
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Image className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No Ordinals found in this wallet</p>
                <p className="text-sm">Digital artifacts will appear here when available</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="runes" className="mt-4">
            {walletState.runesBalance && walletState.runesBalance.length > 0 ? (
              <div className="space-y-3">
                {walletState.runesBalance.map((rune: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">
                          {rune.rune_name || rune.name || `Rune Token #${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          Balance: {rune.balance || rune.amount || '0'}
                        </p>
                        {rune.symbol && (
                          <Badge variant="outline" className="mt-1">
                            {rune.symbol}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const explorerUrl = `https://runes.com/rune/${rune.rune_name || rune.name}`;
                          window.open(explorerUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Coins className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No Runes found in this wallet</p>
                <p className="text-sm">Fungible tokens will appear here when available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BitcoinWalletDetails;