/**
 * BRC-20 Transfer Card Component
 * 
 * Component for transferring BRC-20 tokens
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { DataSourceManager } from '@/libs/lasereyes-core/src/lib/data-sources/manager';
import { Brc20Balance } from '@/libs/lasereyes-core/src/types/lasereyes';
import { getBrc20SendJsonStr } from '@/libs/lasereyes-core/src/lib/brc-20/utils';
import { useNotifications } from '@/hooks/useNotifications';

interface BRC20TransferCardProps {
  onTransferComplete?: () => void;
  className?: string;
}

export const BRC20TransferCard: React.FC<BRC20TransferCardProps> = ({
  onTransferComplete,
  className = ''
}) => {
  const { address, connected, signPsbt } = useWallet();
  const { showNotification } = useNotifications();
  const [balances, setBalances] = useState<Brc20Balance[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (connected && address) {
      fetchBRC20Balances();
    }
  }, [connected, address]);

  const fetchBRC20Balances = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const dataSourceManager = DataSourceManager.getInstance();
      const brc20Data = await dataSourceManager.getAddressBrc20Balances(address);
      setBalances(brc20Data || []);
      
      // Select first token by default if available
      if (brc20Data && brc20Data.length > 0) {
        setSelectedToken(brc20Data[0].ticker);
      }
    } catch (err) {
      console.error('Error fetching BRC-20 balances:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch BRC-20 balances'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateTransfer = (): boolean => {
    if (!selectedToken) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a token'
      });
      return false;
    }

    if (!recipientAddress) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a recipient address'
      });
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a valid amount'
      });
      return false;
    }

    const selectedBalance = balances.find(b => b.ticker === selectedToken);
    if (selectedBalance) {
      const available = parseFloat(selectedBalance.available);
      if (parseFloat(amount) > available) {
        showNotification({
          type: 'error',
          title: 'Insufficient Balance',
          message: `You only have ${available} ${selectedToken} available`
        });
        return false;
      }
    }

    return true;
  };

  const handleTransfer = async () => {
    if (!validateTransfer()) return;

    setIsSending(true);
    try {
      // Generate the transfer inscription JSON
      const transferJson = getBrc20SendJsonStr(selectedToken, amount);
      
      // Here you would typically:
      // 1. Create the inscription with the transfer JSON
      // 2. Build a PSBT for the transfer
      // 3. Sign the PSBT
      // 4. Broadcast the transaction
      
      showNotification({
        type: 'info',
        title: 'Transfer Initiated',
        message: `Transfer of ${amount} ${selectedToken} is being processed...`
      });

      // For demo purposes, we'll simulate a successful transfer
      setTimeout(() => {
        showNotification({
          type: 'success',
          title: 'Transfer Successful',
          message: `Successfully transferred ${amount} ${selectedToken}`
        });
        
        // Reset form
        setAmount('');
        setRecipientAddress('');
        
        // Refresh balances
        fetchBRC20Balances();
        
        // Call completion callback
        if (onTransferComplete) {
          onTransferComplete();
        }
      }, 2000);

    } catch (err) {
      console.error('Error during transfer:', err);
      showNotification({
        type: 'error',
        title: 'Transfer Failed',
        message: 'Failed to complete the transfer. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!connected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Transfer BRC-20</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to transfer BRC-20 tokens
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedBalance = balances.find(b => b.ticker === selectedToken);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Transfer BRC-20</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Token Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Token
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              disabled={isLoading || balances.length === 0}
            >
              {balances.length === 0 ? (
                <option value="">No tokens available</option>
              ) : (
                balances.map((balance) => (
                  <option key={balance.ticker} value={balance.ticker}>
                    {balance.ticker} - Available: {balance.available}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
              placeholder="bc1q..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              disabled={isSending}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:border-gray-700"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSending || !selectedToken}
                step="any"
              />
              {selectedBalance && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-orange-600 hover:text-orange-700"
                  onClick={() => setAmount(selectedBalance.available)}
                >
                  MAX
                </button>
              )}
            </div>
            {selectedBalance && (
              <p className="text-xs text-muted-foreground mt-1">
                Available: {selectedBalance.available} {selectedToken}
              </p>
            )}
          </div>

          {/* Transfer Button */}
          <Button
            className="w-full"
            onClick={handleTransfer}
            disabled={isSending || isLoading || balances.length === 0}
          >
            {isSending ? 'Processing...' : 'Transfer'}
          </Button>

          {/* Warning */}
          <p className="text-xs text-muted-foreground text-center">
            BRC-20 transfers require inscriptions. Network fees apply.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BRC20TransferCard;