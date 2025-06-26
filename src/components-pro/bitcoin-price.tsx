'use client';

import { useState, useEffect } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";
import { useMarketData } from "@/hooks/useMarketData";

export function BitcoinPrice() {
  const marketData = useMarketData();
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [percentChange, setPercentChange] = useState<number>(0);

  useEffect(() => {
    if (marketData?.btcPrice) {
      const newPrice = marketData.btcPrice;
      
      if (currentPrice !== null) {
        setPriceChange(newPrice > currentPrice ? 'up' : 'down');
        
        // Reset after animation
        const timer = setTimeout(() => {
          setPriceChange(null);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
      
      setCurrentPrice(newPrice);
      setPercentChange(marketData.btcChange24h || 0);
    }
  }, [marketData, currentPrice]);

  if (!currentPrice) {
    return (
      <div className="flex items-center space-x-2 rounded-md bg-zinc-800/50 px-3 py-1.5">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-700"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 rounded-md bg-zinc-800/50 px-3 py-1.5">
      <span className="font-mono text-sm font-medium">BTC</span>
      <span 
        className={`font-mono text-sm font-medium transition-colors duration-300 ${
          priceChange === 'up' ? "text-green-500" : 
          priceChange === 'down' ? "text-red-500" : ""
        }`}
      >
        ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </span>
      <div 
        className={`flex items-center rounded px-1 py-0.5 text-xs ${
          percentChange >= 0 ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
        }`}
      >
        {percentChange >= 0 ? (
          <ArrowUpIcon className="mr-0.5 h-3 w-3" />
        ) : (
          <ArrowDownIcon className="mr-0.5 h-3 w-3" />
        )}
        {Math.abs(percentChange).toFixed(2)}%
      </div>
    </div>
  );
}
