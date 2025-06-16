'use client';

import { Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddressSearchIndicatorProps {
  searchQuery: string;
  isSearching: boolean;
  hasResults: boolean;
  resultCount?: number;
  type: 'ordinals' | 'runes';
}

export function AddressSearchIndicator({ 
  searchQuery, 
  isSearching, 
  hasResults, 
  resultCount = 0, 
  type 
}: AddressSearchIndicatorProps) {
  const isBitcoinAddress = (address: string): boolean => {
    const patterns = [
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // P2PKH and P2SH (legacy)
      /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/, // Bech32 (native segwit)
      /^tb1[a-zA-HJ-NP-Z0-9]{39,59}$/, // Testnet bech32
    ];
    return patterns.some(pattern => pattern.test(address));
  };

  if (!searchQuery || !isBitcoinAddress(searchQuery.trim())) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 right-0 mt-1 z-50"
    >
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-3">
          {isSearching ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-orange-400">
                Searching Bitcoin address for {type}...
              </span>
            </div>
          ) : hasResults ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-400">
                Found {resultCount} {type} for this address
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-400">
                No {type} found for this address
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          Address: {searchQuery.substring(0, 8)}...{searchQuery.substring(searchQuery.length - 8)}
        </div>
      </div>
    </motion.div>
  );
}