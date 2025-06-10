/**
 * Order Confirmation Modal for RUNESDX.IO Integration
 * Provides detailed order confirmation with fee breakdown and transaction details
 */

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Copy,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Zap
} from 'lucide-react';
import { RunesDXOrder } from '@/services/RunesDXService';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: RunesDXOrder | null;
  onViewOnExplorer?: (txHash: string) => void;
  onCopyOrderId?: (orderId: string) => void;
}

export function OrderConfirmationModal({
  isOpen,
  onClose,
  order,
  onViewOnExplorer,
  onCopyOrderId
}: OrderConfirmationModalProps) {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-500 text-yellow-500 bg-yellow-500/10';
      case 'placed':
        return 'border-blue-500 text-blue-500 bg-blue-500/10';
      case 'partial':
        return 'border-orange-500 text-orange-500 bg-orange-500/10';
      case 'filled':
        return 'border-green-500 text-green-500 bg-green-500/10';
      case 'cancelled':
        return 'border-gray-500 text-gray-500 bg-gray-500/10';
      case 'failed':
        return 'border-red-500 text-red-500 bg-red-500/10';
      default:
        return 'border-gray-500 text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'placed':
        return <Zap className="h-4 w-4" />;
      case 'partial':
        return <Clock className="h-4 w-4" />;
      case 'filled':
        return <Check className="h-4 w-4" />;
      case 'cancelled':
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    onCopyOrderId?.(order.id);
  };

  const handleViewOnExplorer = () => {
    if (order.txHash) {
      onViewOnExplorer?.(order.txHash);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {order.side === 'buy' ? (
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-red-500" />
            )}
            Order Confirmation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Order ID</div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-mono">{order.id.slice(0, 8)}...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleCopyOrderId}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Type</div>
                <div className="font-medium capitalize">{order.type}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Side</div>
                <div className={`font-medium capitalize ${
                  order.side === 'buy' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {order.side}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Rune</div>
                <div className="font-medium">{order.runeName || order.runeSymbol}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Amount</div>
                <div className="font-medium">{order.amount}</div>
              </div>
            </div>

            {order.price && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Price</div>
                  <div className="font-medium">{order.price} BTC</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total Value</div>
                  <div className="font-medium">{order.totalValue} BTC</div>
                </div>
              </div>
            )}

            {order.executedPrice && order.executedAmount && (
              <>
                <Separator />
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm font-medium mb-2">Execution Details</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Executed Price</div>
                      <div className="font-medium">{order.executedPrice} BTC</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Executed Amount</div>
                      <div className="font-medium">{order.executedAmount}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Fee Breakdown */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Fee Breakdown</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span>{order.fees.networkFee} BTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trading Fee</span>
                <span>{order.fees.tradingFee} BTC</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Fees</span>
                <span>{order.fees.total} BTC</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Created</div>
              <div>{new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Updated</div>
              <div>{new Date(order.updatedAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Transaction Hash */}
          {order.txHash && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium">Transaction</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-muted-foreground">
                    {order.txHash.slice(0, 16)}...{order.txHash.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => navigator.clipboard.writeText(order.txHash!)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleViewOnExplorer}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {order.txHash && (
              <Button
                variant="default"
                onClick={handleViewOnExplorer}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Explorer
              </Button>
            )}
          </div>

          {/* Platform Attribution */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              Powered by{' '}
              <span className="font-medium text-orange-500">RUNESDX.IO</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}