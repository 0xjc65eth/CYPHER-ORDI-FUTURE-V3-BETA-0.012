'use client';

import { useState } from 'react';
import { useBitcoinAuth } from '@/hooks/useBitcoinAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Copy, 
  LogOut, 
  User, 
  Settings,
  ExternalLink,
  Bitcoin
} from 'lucide-react';

export function BitcoinUserMenu() {
  const { user, signOut, getFormattedAddress, getWalletName } = useBitcoinAuth();
  const [copied, setCopied] = useState(false);

  if (!user) {
    return null;
  }

  const copyAddress = async () => {
    await navigator.clipboard.writeText(user.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openExplorer = () => {
    const explorerUrl = `https://mempool.space/address/${user.address}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-gray-800 border-gray-700 hover:bg-gray-700"
        >
          <Wallet className="h-4 w-4 text-orange-500" />
          <span className="hidden sm:inline">{getFormattedAddress()}</span>
          <Badge variant="secondary" className="ml-2 bg-orange-500/20 text-orange-400">
            {getWalletName()}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-700">
        <DropdownMenuLabel className="text-gray-400">Bitcoin Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        
        <DropdownMenuItem 
          onClick={copyAddress}
          className="cursor-pointer hover:bg-gray-800 text-gray-200"
        >
          <Copy className="mr-2 h-4 w-4" />
          {copied ? 'Copied!' : 'Copy Address'}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={openExplorer}
          className="cursor-pointer hover:bg-gray-800 text-gray-200"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-gray-800 text-gray-200"
          onClick={() => window.location.href = '/dashboard'}
        >
          <Bitcoin className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-gray-800 text-gray-200"
          onClick={() => window.location.href = '/portfolio'}
        >
          <User className="mr-2 h-4 w-4" />
          Portfolio
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-gray-800 text-gray-200"
          onClick={() => window.location.href = '/settings'}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        <DropdownMenuItem 
          onClick={signOut}
          className="cursor-pointer hover:bg-gray-800 text-red-400 hover:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}