'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Minus, 
  Activity, BarChart3, Target,
  AlertTriangle, CheckCircle, XCircle,
  RefreshCw, Brain
} from 'lucide-react';
import { useBitcoinTechnicalAnalysis, useMajorCryptoTechnicalAnalysis } from '@/hooks/useTechnicalAnalysis';
import { MarketAnalysis } from '@/services/TechnicalAnalysisService';

interface TechnicalAnalysisCardProps {
  className?: string;
}

const TechnicalAnalysisCard: React.FC<TechnicalAnalysisCardProps> = ({ className = '' }) => {
  const { 
    analysis: btcAnalysis, 
    isLoading: btcLoading, 
    error: btcError,
    refetch: refetchBtc 
  } = useBitcoinTechnicalAnalysis();

  const { 
    analysis: majorAnalysis, 
    isLoading: majorLoading,
    error: majorError 
  } = useMajorCryptoTechnicalAnalysis();

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'sell': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-orange-400" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-green-400';
      case 'sell': return 'text-red-400';
      default: return 'text-orange-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-orange-400" />;
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'high': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatPrice = (price: number) => {
    return price > 1000 ? 
      `$${price.toLocaleString()}` : 
      `$${price.toFixed(2)}`;
  };

  const formatIndicator = (value: number, decimals = 2) => {
    return value.toFixed(decimals);
  };

  const renderAnalysisCard = (analysis: MarketAnalysis, isMain = false) => (
    <div className={`bg-gray-900 border border-orange-500/30 p-3 ${isMain ? 'col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 font-bold text-sm">{analysis.symbol}</span>
          <Badge variant="outline" className={`text-xs ${getSignalColor(analysis.indicators.signal)}`}>
            {analysis.indicators.signal.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {getSignalIcon(analysis.indicators.signal)}
          {getTrendIcon(analysis.indicators.trend)}
        </div>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Price:</span>
          <span className="text-orange-500 font-mono">{formatPrice(analysis.price)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">RSI:</span>
          <span className={`font-mono ${
            analysis.indicators.rsi > 70 ? 'text-red-400' : 
            analysis.indicators.rsi < 30 ? 'text-green-400' : 'text-orange-500'
          }`}>
            {formatIndicator(analysis.indicators.rsi)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Confidence:</span>
          <span className="text-orange-500 font-mono">{formatIndicator(analysis.indicators.confidence)}%</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Risk:</span>
          <div className="flex items-center gap-1">
            {getRiskIcon(analysis.riskLevel)}
            <span className={`text-xs ${
              analysis.riskLevel === 'low' ? 'text-green-400' :
              analysis.riskLevel === 'medium' ? 'text-orange-400' : 'text-red-400'
            }`}>
              {analysis.riskLevel.toUpperCase()}
            </span>
          </div>
        </div>

        {isMain && (
          <>
            <div className="border-t border-orange-500/20 pt-2 mt-2">
              <div className="text-gray-400 text-xs mb-1">Price Targets:</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-gray-500">Short</div>
                  <div className="text-green-400 font-mono">{formatPrice(analysis.priceTarget.short)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Medium</div>
                  <div className="text-orange-400 font-mono">{formatPrice(analysis.priceTarget.medium)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Long</div>
                  <div className="text-blue-400 font-mono">{formatPrice(analysis.priceTarget.long)}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-orange-500/20 pt-2 mt-2">
              <div className="text-gray-400 text-xs mb-1">Key Levels:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-gray-500">Support</div>
                  <div className="text-green-400 font-mono">{formatPrice(analysis.indicators.support)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Resistance</div>
                  <div className="text-red-400 font-mono">{formatPrice(analysis.indicators.resistance)}</div>
                </div>
              </div>
            </div>

            {analysis.insights.length > 0 && (
              <div className="border-t border-orange-500/20 pt-2 mt-2">
                <div className="text-gray-400 text-xs mb-1">Key Insights:</div>
                <div className="space-y-1">
                  {analysis.insights.slice(0, 2).map((insight, index) => (
                    <div key={index} className="text-xs text-gray-300 bg-gray-800 p-1 rounded">
                      • {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <Card className={`bg-black border-orange-500/30 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-orange-500">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Technical Analysis
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={refetchBtc}
              disabled={btcLoading || majorLoading}
              className="text-orange-500 hover:bg-orange-500/10"
            >
              <RefreshCw className={`w-4 h-4 ${(btcLoading || majorLoading) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {btcError || majorError ? (
          <div className="bg-red-900/20 border border-red-500/30 p-3 rounded">
            <div className="text-red-400 text-sm">
              Analysis Error: {btcError || majorError}
            </div>
          </div>
        ) : (
          <>
            {/* Bitcoin Analysis (Featured) */}
            {btcAnalysis && (
              <div>
                <h4 className="text-orange-500 text-sm font-bold mb-2">Bitcoin Analysis</h4>
                {renderAnalysisCard(btcAnalysis, true)}
              </div>
            )}

            {/* Major Cryptos Grid */}
            {majorAnalysis && majorAnalysis.length > 0 && (
              <div>
                <h4 className="text-orange-500 text-sm font-bold mb-2">Market Overview</h4>
                <div className="grid grid-cols-2 gap-2">
                  {majorAnalysis
                    .filter(analysis => analysis.symbol !== 'BTC')
                    .slice(0, 4)
                    .map((analysis) => (
                      <div key={analysis.symbol}>
                        {renderAnalysisCard(analysis)}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {(btcLoading || majorLoading) && !btcAnalysis && !majorAnalysis && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-orange-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing market data...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TechnicalAnalysisCard;