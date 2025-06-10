import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, AlertCircle, Activity, 
  Target, Shield, Zap, DollarSign, Brain, BarChart3 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface OpportunityData {
  asset?: string;
  type?: string;
  confidence?: number;
  potential?: number;
  risk?: string;
  timeframe?: string;
  entry?: number;
  target?: number;
  stopLoss?: number;
  marketCondition?: string;
  technicalAnalysis?: {
    rsi?: number;
    macd?: string;
    volume?: string;
    support?: number;
    resistance?: number;
  };
  fundamentals?: {
    news?: string;
    sentiment?: string;
    onChainMetrics?: any;
  };
}

interface MessageDataCardProps {
  data: any;
}

const MessageDataCard: React.FC<MessageDataCardProps> = ({ data }) => {
  // Handle empty data
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return null;
  }

  // Handle array of opportunities
  if (Array.isArray(data)) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, staggerChildren: 0.1 }}
        className="grid gap-3 mt-3"
      >
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <OpportunityCard data={item} />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Handle single opportunity
  if (data.type || data.asset || data.confidence) {
    return (
      <div className="mt-3">
        <OpportunityCard data={data} />
      </div>
    );
  }

  // Handle market data
  if (data.bitcoin || data.ethereum || data.price) {
    return <MarketDataCard data={data} />;
  }

  // Handle portfolio data
  if (data.portfolio || data.balance || data.holdings) {
    return <PortfolioCard data={data} />;
  }

  // Handle alerts/notifications
  if (data.alert || data.notification) {
    return <AlertCard data={data} />;
  }

  // Default to formatted JSON
  return (
    <Card className="mt-3 bg-gray-800/50 border-gray-700">
      <CardContent className="p-4">
        <pre className="text-xs overflow-x-auto text-gray-300">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};

const OpportunityCard: React.FC<{ data: OpportunityData }> = ({ data }) => {
  const getRiskColor = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'buy': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'sell': return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'arbitrage': return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'defi': return <Activity className="h-5 w-5 text-purple-500" />;
      default: return <Target className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="w-full"
    >
      <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTypeIcon(data.type)}
              <div>
                <CardTitle className="text-lg font-bold text-white">
                  {data.asset || 'Oportunidade'}
                </CardTitle>
                <p className="text-sm text-gray-400">
                  {data.type || 'Trading'} • {data.timeframe || 'Curto prazo'}
                </p>
              </div>
            </div>
            
            {data.confidence && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Confiança</p>
                <p className="text-2xl font-bold text-purple-500">
                  {Math.round(data.confidence * 100)}%
                </p>
              </div>
            )}
          </div>
        </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Potential and Risk */}
        <div className="grid grid-cols-2 gap-4">
          {data.potential && (
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-400">Potencial</span>
              </div>
              <p className="text-xl font-bold text-green-500">
                +{data.potential}%
              </p>
            </div>
          )}
          
          {data.risk && (
            <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400">Risco</span>
              </div>
              <p className={cn("text-xl font-bold", getRiskColor(data.risk))}>
                {data.risk}
              </p>
            </div>
          )}
        </div>

        {/* Price Levels */}
        {(data.entry || data.target || data.stopLoss) && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Níveis de Preço
            </h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {data.entry && (
                <div className="bg-blue-500/10 rounded p-2 border border-blue-500/30">
                  <p className="text-xs text-blue-400">Entrada</p>
                  <p className="font-bold text-blue-500">${data.entry}</p>
                </div>
              )}
              {data.target && (
                <div className="bg-green-500/10 rounded p-2 border border-green-500/30">
                  <p className="text-xs text-green-400">Alvo</p>
                  <p className="font-bold text-green-500">${data.target}</p>
                </div>
              )}
              {data.stopLoss && (
                <div className="bg-red-500/10 rounded p-2 border border-red-500/30">
                  <p className="text-xs text-red-400">Stop Loss</p>
                  <p className="font-bold text-red-500">${data.stopLoss}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Technical Analysis */}
        {data.technicalAnalysis && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análise Técnica
            </h4>
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
              {data.technicalAnalysis.rsi && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">RSI</span>
                  <Badge variant={data.technicalAnalysis.rsi > 70 ? "destructive" : data.technicalAnalysis.rsi < 30 ? "default" : "secondary"}>
                    {data.technicalAnalysis.rsi}
                  </Badge>
                </div>
              )}
              {data.technicalAnalysis.macd && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">MACD</span>
                  <span className="text-xs font-medium">{data.technicalAnalysis.macd}</span>
                </div>
              )}
              {data.technicalAnalysis.volume && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Volume</span>
                  <span className="text-xs font-medium">{data.technicalAnalysis.volume}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Market Condition */}
        {data.marketCondition && (
          <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-purple-400">Condição de Mercado</span>
            </div>
            <p className="text-sm font-medium text-gray-300 mt-1">
              {data.marketCondition}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
};

const MarketDataCard: React.FC<{ data: any }> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="mt-3"
    >
        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Dados de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
        {Object.entries(data).map(([key, value]: [string, any]) => (
          <div key={key} className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 capitalize">{key}</p>
            <p className="text-lg font-bold text-white">
              {typeof value === 'object' ? JSON.stringify(value) : value}
            </p>
          </div>
          ))}
          </CardContent>
        </Card>
      </motion.div>
  );
};

const PortfolioCard: React.FC<{ data: any }> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-3"
    >
        <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
        <pre className="text-xs overflow-x-auto text-gray-300">
          {JSON.stringify(data, null, 2)}
          </pre>
          </CardContent>
        </Card>
      </motion.div>
  );
};

const AlertCard: React.FC<{ data: any }> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
      className="mt-3"
    >
        <Card className="bg-gradient-to-br from-yellow-900/20 to-red-900/20 border-yellow-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Alerta
            </CardTitle>
          </CardHeader>
          <CardContent>
        <p className="text-sm text-gray-300">
          {data.alert || data.notification || JSON.stringify(data)}
          </p>
          </CardContent>
        </Card>
      </motion.div>
  );
};

export default MessageDataCard;