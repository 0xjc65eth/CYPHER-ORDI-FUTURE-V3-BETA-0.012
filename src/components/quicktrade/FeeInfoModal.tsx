'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Shield, 
  TrendingUp, 
  Users, 
  Zap,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { FEE_RECIPIENTS } from '@/config/feeRecipients';
import { QUICKTRADE_CONFIG } from '@/config/quicktrade';

interface FeeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionValue?: number;
  calculatedFee?: number;
  isCapped?: boolean;
}

export function FeeInfoModal({ 
  isOpen, 
  onClose, 
  transactionValue = 0,
  calculatedFee = 0,
  isCapped = false 
}: FeeInfoModalProps) {
  const feePercentage = QUICKTRADE_CONFIG.SERVICE_FEE * 100;
  const maxFee = QUICKTRADE_CONFIG.MAX_FEE_USD;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <span>QuickTrade V3.0 Fee Structure</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Fee Overview */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              Service Fee Overview
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{feePercentage}%</div>
                <div className="text-sm text-gray-400">Service Fee Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">${maxFee}</div>
                <div className="text-sm text-gray-400">Maximum Fee Cap</div>
              </div>
            </div>

            {transactionValue > 0 && (
              <div className="bg-gray-700 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Transaction Value:</span>
                  <span className="font-semibold">${transactionValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Calculated Fee ({feePercentage}%):</span>
                  <span className="font-semibold">${(transactionValue * QUICKTRADE_CONFIG.SERVICE_FEE).toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Final Fee:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-400">${calculatedFee.toFixed(4)}</span>
                    {isCapped && (
                      <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                        Capped
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* What the Fee Covers */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              What Your Fee Covers
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <div className="font-medium">DEX Aggregation</div>
                  <div className="text-sm text-gray-400">Access to 22+ DEXs across 8 networks for best prices</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <div className="font-medium">Gas Optimization</div>
                  <div className="text-sm text-gray-400">Smart routing to minimize transaction costs</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <div className="font-medium">Platform Development</div>
                  <div className="text-sm text-gray-400">Continuous improvement and new features</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <div className="font-medium">24/7 Monitoring</div>
                  <div className="text-sm text-gray-400">Real-time system monitoring and support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Recipients */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2 text-purple-500" />
              Fee Recipients
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-300 mb-1">EVM Networks (Ethereum, Arbitrum, etc.)</div>
                <div className="bg-gray-700 rounded p-2 flex items-center justify-between">
                  <code className="text-xs text-green-400 font-mono">{FEE_RECIPIENTS.EVM}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://etherscan.io/address/${FEE_RECIPIENTS.EVM}`, '_blank')}
                    className="h-6 px-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-300 mb-1">Solana Network</div>
                <div className="bg-gray-700 rounded p-2 flex items-center justify-between">
                  <code className="text-xs text-green-400 font-mono">{FEE_RECIPIENTS.SOLANA}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://solscan.io/account/${FEE_RECIPIENTS.SOLANA}`, '_blank')}
                    className="h-6 px-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Distribution */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
              Revenue Distribution
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Development & Engineering</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                  <span className="text-sm font-medium">40%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Operations & Maintenance</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }} />
                  </div>
                  <span className="text-sm font-medium">30%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Marketing & Growth</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '20%' }} />
                  </div>
                  <span className="text-sm font-medium">20%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Emergency Reserves</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '10%' }} />
                  </div>
                  <span className="text-sm font-medium">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-blue-400">Why Choose QuickTrade V3.0?</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div>✅ Lowest fees in the market</div>
                <div>✅ 99.5% success rate</div>
                <div>✅ Cross-chain compatibility</div>
              </div>
              <div className="space-y-2">
                <div>✅ Instant price comparison</div>
                <div>✅ MEV protection</div>
                <div>✅ Professional-grade infrastructure</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              I Understand
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://docs.cypherordi.com/quicktrade', '_blank')}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Learn More
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}