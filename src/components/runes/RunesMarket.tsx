'use client';

import React from 'react';
import { useTradingStore } from '@/stores/trading-store';

interface RunesMarketProps {
  onRuneSelect: (runeName: string) => void;
}

export const RunesMarket: React.FC<RunesMarketProps> = ({ onRuneSelect }) => {
  const { runes } = useTradingStore();

  const formatSupply = (amount: number | null, divisibility: number) => {
    if (!amount) return 'N/A';
    return (amount / Math.pow(10, divisibility)).toLocaleString();
  };

  const getMintProgress = (mints: number, cap: number | null) => {
    if (!cap) return 0;
    return Math.min((mints / cap) * 100, 100);
  };

  const getStatusColor = (mints: number, cap: number | null) => {
    if (!cap) return 'text-bloomberg-blue';
    const progress = getMintProgress(mints, cap);
    if (progress >= 100) return 'text-bloomberg-red';
    if (progress >= 80) return 'text-bloomberg-yellow';
    return 'text-bloomberg-green';
  };

  const sortedRunes = [...runes].sort((a, b) => {
    // Sort by mints descending
    return b.mints - a.mints;
  });

  return (
    <div className="h-full space-y-4">
      {/* Market Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-terminal text-bloomberg-orange">Live Runes Market</h3>
          <div className="text-xs text-bloomberg-orange/60">
            {runes.length} runes • Real-time data
          </div>
        </div>
        
        <div className="text-right text-xs text-bloomberg-orange/60">
          <div>Total Mints: {runes.reduce((sum, r) => sum + r.mints, 0).toLocaleString()}</div>
          <div>Active: {runes.filter(r => r.cap && r.mints < r.cap).length}</div>
        </div>
      </div>

      {/* Market Table */}
      <div className="bg-bloomberg-black-700 rounded border border-bloomberg-orange/20 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-3 bg-bloomberg-black-600 border-b border-bloomberg-orange/20 text-xs text-bloomberg-orange/60 font-terminal">
          <div>RUNE</div>
          <div>MINTS</div>
          <div>SUPPLY</div>
          <div>PROGRESS</div>
          <div>STATUS</div>
          <div>ACTION</div>
        </div>

        {/* Table Body */}
        <div className="max-h-64 overflow-y-auto">
          {sortedRunes.map((rune) => (
            <div 
              key={rune.id}
              className="grid grid-cols-6 gap-4 p-3 border-b border-bloomberg-orange/10 hover:bg-bloomberg-black-600 transition-colors cursor-pointer"
              onClick={() => onRuneSelect(rune.name)}
            >
              {/* Rune Name */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-bloomberg-orange/30 to-bloomberg-blue/30 rounded border border-bloomberg-orange/30 flex items-center justify-center">
                  <span className="text-xs font-terminal text-bloomberg-orange">R</span>
                </div>
                <div>
                  <div className="text-sm font-terminal text-bloomberg-orange truncate">
                    {rune.name}
                  </div>
                  <div className="text-xs text-bloomberg-orange/60">
                    {rune.symbol || rune.name.substring(0, 4)}
                  </div>
                </div>
              </div>

              {/* Mints */}
              <div className="flex items-center">
                <div className="text-sm font-terminal text-bloomberg-orange">
                  {rune.mints.toLocaleString()}
                </div>
              </div>

              {/* Supply */}
              <div className="flex items-center">
                <div>
                  <div className="text-sm font-terminal text-bloomberg-orange">
                    {formatSupply(rune.amount, rune.divisibility)}
                  </div>
                  <div className="text-xs text-bloomberg-orange/60">
                    per mint
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center">
                {rune.cap ? (
                  <div className="w-full">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-bloomberg-orange/60">
                        {getMintProgress(rune.mints, rune.cap).toFixed(1)}%
                      </span>
                      <span className="text-bloomberg-orange/60">
                        {rune.cap.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-bloomberg-black-600 rounded-full h-2">
                      <div 
                        className="bg-bloomberg-green h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getMintProgress(rune.mints, rune.cap)}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-bloomberg-blue">No Cap</div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center">
                <div className={`text-sm font-terminal ${getStatusColor(rune.mints, rune.cap)}`}>
                  {rune.cap && rune.mints >= rune.cap ? 'COMPLETE' : 'MINTING'}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center">
                <button 
                  className="text-xs bg-bloomberg-orange/20 hover:bg-bloomberg-orange/30 text-bloomberg-orange px-2 py-1 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRuneSelect(rune.name);
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {runes.length === 0 && (
          <div className="text-center py-8 text-bloomberg-orange/60">
            <div className="text-lg font-terminal">No runes data</div>
            <div className="text-sm">Loading from blockchain...</div>
          </div>
        )}
      </div>

      {/* Market Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bloomberg-black-700 p-3 rounded border border-bloomberg-orange/20">
          <div className="text-xs text-bloomberg-orange/60 mb-1">Most Active</div>
          <div className="text-sm font-terminal text-bloomberg-orange">
            {sortedRunes[0]?.name || 'N/A'}
          </div>
          <div className="text-xs text-bloomberg-green">
            {sortedRunes[0]?.mints.toLocaleString() || '0'} mints
          </div>
        </div>

        <div className="bg-bloomberg-black-700 p-3 rounded border border-bloomberg-orange/20">
          <div className="text-xs text-bloomberg-orange/60 mb-1">Recently Etched</div>
          <div className="text-sm font-terminal text-bloomberg-orange">
            {[...runes]
              .sort((a, b) => b.timestamp - a.timestamp)[0]?.name || 'N/A'}
          </div>
          <div className="text-xs text-bloomberg-blue">Latest</div>
        </div>

        <div className="bg-bloomberg-black-700 p-3 rounded border border-bloomberg-orange/20">
          <div className="text-xs text-bloomberg-orange/60 mb-1">Completion Rate</div>
          <div className="text-sm font-terminal text-bloomberg-orange">
            {runes.length > 0 
              ? `${((runes.filter(r => r.cap && r.mints >= r.cap).length / runes.length) * 100).toFixed(1)}%`
              : '0%'
            }
          </div>
          <div className="text-xs text-bloomberg-orange/60">
            {runes.filter(r => r.cap && r.mints >= r.cap).length} complete
          </div>
        </div>
      </div>
    </div>
  );
};