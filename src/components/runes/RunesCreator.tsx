'use client';

import React, { useState } from 'react';
import { useTradingStore } from '@/stores/trading-store';

interface RuneEtchingForm {
  name: string;
  symbol: string;
  divisibility: number;
  amount: number;
  cap: number;
  heightStart: number;
  heightEnd: number;
  offsetStart: number;
  offsetEnd: number;
  turbo: boolean;
}

export const RunesCreator: React.FC = () => {
  const { addAlert } = useTradingStore();
  const [isEtching, setIsEtching] = useState(false);
  const [formData, setFormData] = useState<RuneEtchingForm>({
    name: '',
    symbol: '',
    divisibility: 0,
    amount: 1000,
    cap: 21000,
    heightStart: 840000,
    heightEnd: 0,
    offsetStart: 0,
    offsetEnd: 0,
    turbo: false
  });

  const [estimatedFee, setEstimatedFee] = useState(0.001);

  const handleInputChange = (field: keyof RuneEtchingForm, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Calculate estimated fee based on complexity
    const baseFee = 0.001;
    const complexityMultiplier = 1 + (formData.divisibility * 0.1) + (formData.turbo ? 0.5 : 0);
    setEstimatedFee(baseFee * complexityMultiplier);
  };

  const validateRuneName = (name: string): boolean => {
    // Rune names must be A-Z and • (bullet)
    const runePattern = /^[A-Z•]+$/;
    return runePattern.test(name) && name.length >= 1 && name.length <= 28;
  };

  const handleEtchRune = async () => {
    try {
      setIsEtching(true);

      // Validation
      if (!validateRuneName(formData.name)) {
        addAlert({
          type: 'rune',
          title: 'Invalid Rune Name',
          message: 'Rune names must contain only A-Z and • characters (1-28 chars)',
          severity: 'error',
          read: false
        });
        return;
      }

      if (formData.cap <= 0 || formData.amount <= 0) {
        addAlert({
          type: 'rune',
          title: 'Invalid Parameters',
          message: 'Cap and amount must be greater than 0',
          severity: 'error',
          read: false
        });
        return;
      }

      // Simulate etching process (in real implementation, this would interact with Bitcoin blockchain)
      addAlert({
        type: 'rune',
        title: 'Etching Initiated',
        message: `Creating rune ${formData.name} with ${formData.cap.toLocaleString()} cap`,
        severity: 'info',
        read: false
      });

      // Simulate blockchain interaction delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Success
      addAlert({
        type: 'rune',
        title: 'Rune Etched Successfully!',
        message: `${formData.name} has been etched to the Bitcoin blockchain`,
        severity: 'success',
        read: false
      });

      // Reset form
      setFormData({
        name: '',
        symbol: '',
        divisibility: 0,
        amount: 1000,
        cap: 21000,
        heightStart: 840000,
        heightEnd: 0,
        offsetStart: 0,
        offsetEnd: 0,
        turbo: false
      });

    } catch (error) {
      addAlert({
        type: 'rune',
        title: 'Etching Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        severity: 'error',
        read: false
      });
    } finally {
      setIsEtching(false);
    }
  };

  return (
    <div className="h-full space-y-4">
      <div className="text-center pb-4 border-b border-bloomberg-orange/20">
        <h3 className="text-lg font-terminal text-bloomberg-orange">Etch New Rune</h3>
        <div className="text-xs text-bloomberg-orange/60 mt-1">
          Create a new Rune on Bitcoin
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {/* Basic Info */}
        <div className="bg-bloomberg-black-700 p-4 rounded border border-bloomberg-orange/20">
          <h4 className="text-sm font-terminal text-bloomberg-orange mb-3">Basic Information</h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-bloomberg-orange/60 mb-1 block">
                Rune Name (A-Z and •)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value.toUpperCase())}
                placeholder="EXAMPLE•RUNE•NAME"
                className="w-full bg-bloomberg-black-600 text-bloomberg-orange text-sm border border-bloomberg-orange/30 rounded px-3 py-2 font-terminal"
                maxLength={28}
              />
              <div className="text-xs text-bloomberg-orange/40 mt-1">
                {formData.name.length}/28 characters
              </div>
            </div>

            <div>
              <label className="text-xs text-bloomberg-orange/60 mb-1 block">
                Symbol (Optional)
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                placeholder="EXMPL"
                className="w-full bg-bloomberg-black-600 text-bloomberg-orange text-sm border border-bloomberg-orange/30 rounded px-3 py-2 font-terminal"
                maxLength={8}
              />
            </div>

            <div>
              <label className="text-xs text-bloomberg-orange/60 mb-1 block">
                Divisibility (0-38)
              </label>
              <input
                type="number"
                value={formData.divisibility}
                onChange={(e) => handleInputChange('divisibility', parseInt(e.target.value))}
                min="0"
                max="38"
                className="w-full bg-bloomberg-black-600 text-bloomberg-orange text-sm border border-bloomberg-orange/30 rounded px-3 py-2 font-terminal"
              />
              <div className="text-xs text-bloomberg-orange/40 mt-1">
                Number of decimal places (0 = whole numbers only)
              </div>
            </div>
          </div>
        </div>

        {/* Minting Terms */}
        <div className="bg-bloomberg-black-700 p-4 rounded border border-bloomberg-orange/20">
          <h4 className="text-sm font-terminal text-bloomberg-orange mb-3">Minting Terms</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-bloomberg-orange/60 mb-1 block">
                Amount per Mint
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseInt(e.target.value))}
                min="1"
                className="w-full bg-bloomberg-black-600 text-bloomberg-orange text-sm border border-bloomberg-orange/30 rounded px-3 py-2 font-terminal"
              />
            </div>

            <div>
              <label className="text-xs text-bloomberg-orange/60 mb-1 block">
                Total Cap
              </label>
              <input
                type="number"
                value={formData.cap}
                onChange={(e) => handleInputChange('cap', parseInt(e.target.value))}
                min="1"
                className="w-full bg-bloomberg-black-600 text-bloomberg-orange text-sm border border-bloomberg-orange/30 rounded px-3 py-2 font-terminal"
              />
            </div>

            <div>
              <label className="text-xs text-bloomberg-orange/60 mb-1 block">
                Start Height
              </label>
              <input
                type="number"
                value={formData.heightStart}
                onChange={(e) => handleInputChange('heightStart', parseInt(e.target.value))}
                className="w-full bg-bloomberg-black-600 text-bloomberg-orange text-sm border border-bloomberg-orange/30 rounded px-3 py-2 font-terminal"
              />
            </div>

            <div>
              <label className="text-xs text-bloomberg-orange/60 mb-1 block">
                End Height (0 = no limit)
              </label>
              <input
                type="number"
                value={formData.heightEnd}
                onChange={(e) => handleInputChange('heightEnd', parseInt(e.target.value))}
                min="0"
                className="w-full bg-bloomberg-black-600 text-bloomberg-orange text-sm border border-bloomberg-orange/30 rounded px-3 py-2 font-terminal"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="flex items-center gap-2 text-xs text-bloomberg-orange/80">
              <input
                type="checkbox"
                checked={formData.turbo}
                onChange={(e) => handleInputChange('turbo', e.target.checked)}
                className="rounded border-bloomberg-orange/30 bg-bloomberg-black-700 text-bloomberg-orange focus:ring-bloomberg-orange/50"
              />
              Turbo Mode (higher fees, faster confirmation)
            </label>
          </div>
        </div>

        {/* Cost Estimation */}
        <div className="bg-bloomberg-black-700 p-4 rounded border border-bloomberg-orange/20">
          <h4 className="text-sm font-terminal text-bloomberg-orange mb-3">Cost Estimation</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-bloomberg-orange/80">Etching Fee:</span>
              <span className="text-bloomberg-orange font-terminal">{estimatedFee.toFixed(6)} BTC</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-bloomberg-orange/80">Network Fee:</span>
              <span className="text-bloomberg-orange font-terminal">~0.0002 BTC</span>
            </div>
            
            <div className="border-t border-bloomberg-orange/20 pt-2">
              <div className="flex justify-between text-sm font-terminal">
                <span className="text-bloomberg-orange">Total Cost:</span>
                <span className="text-bloomberg-green">{(estimatedFee + 0.0002).toFixed(6)} BTC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-bloomberg-blue/10 p-4 rounded border border-bloomberg-blue/30">
          <h4 className="text-sm font-terminal text-bloomberg-blue mb-2">Rune Summary</h4>
          <div className="text-xs space-y-1">
            <div>Name: <span className="text-bloomberg-orange font-terminal">{formData.name || 'Not set'}</span></div>
            <div>Total Supply: <span className="text-bloomberg-orange font-terminal">{(formData.cap * formData.amount).toLocaleString()}</span></div>
            <div>Max Mints: <span className="text-bloomberg-orange font-terminal">{formData.cap.toLocaleString()}</span></div>
            <div>Per Mint: <span className="text-bloomberg-orange font-terminal">{formData.amount.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      {/* Etch Button */}
      <div className="pt-4 border-t border-bloomberg-orange/20">
        <button
          onClick={handleEtchRune}
          disabled={isEtching || !formData.name || !validateRuneName(formData.name)}
          className="w-full bg-bloomberg-orange text-black font-terminal text-sm py-3 rounded hover:bg-bloomberg-orange/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEtching ? 'Etching Rune...' : 'Etch Rune'}
        </button>
        
        <div className="text-xs text-bloomberg-orange/60 text-center mt-2">
          This will create a Bitcoin transaction to etch your rune
        </div>
      </div>
    </div>
  );
};