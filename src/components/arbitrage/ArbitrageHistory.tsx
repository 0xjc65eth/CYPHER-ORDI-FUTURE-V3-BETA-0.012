'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Filter,
  Calendar,
  BarChart3
} from 'lucide-react';

interface ArbitrageHistoryItem {
  id: string;
  symbol: string;
  type: 'ordinals' | 'runes' | 'tokens';
  detectedAt: number;
  spread: number;
  potentialProfit: number;
  estimatedProfit: number;
  buySource: string;
  sellSource: string;
  status: 'active' | 'expired' | 'executed' | 'failed';
  expiresAt?: number;
  executedAt?: number;
  actualProfit?: number;
  baseCurrency: string;
}

// Mock historical data
const generateHistoryData = (): ArbitrageHistoryItem[] => {
  const now = Date.now();
  const items: ArbitrageHistoryItem[] = [];

  const symbols = ['NodeMonkes', 'ORDI', 'SATS', 'UNCOMMON•GOODS', 'MEME•ECONOMICS', 'Bitcoin Puppets'];
  const types: ('ordinals' | 'runes' | 'tokens')[] = ['ordinals', 'runes', 'tokens'];
  const sources = ['Magic Eden', 'UniSat', 'OKX', 'Ordiscan'];
  const statuses: ('active' | 'expired' | 'executed' | 'failed')[] = ['active', 'expired', 'executed', 'failed'];

  for (let i = 0; i < 24; i++) {
    const detectedAt = now - (i * 3600000) - Math.random() * 3600000; // Last 24h
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const spread = 5 + Math.random() * 20; // 5-25%
    const potentialProfit = 0.001 + Math.random() * 0.01;
    const buySource = sources[Math.floor(Math.random() * sources.length)];
    let sellSource = sources[Math.floor(Math.random() * sources.length)];
    while (sellSource === buySource) {
      sellSource = sources[Math.floor(Math.random() * sources.length)];
    }

    let status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Adjust status based on time
    if (detectedAt > now - 1800000) { // Last 30 min
      status = 'active';
    } else if (detectedAt < now - 7200000) { // Older than 2h
      status = Math.random() > 0.3 ? 'expired' : 'executed';
    }

    const item: ArbitrageHistoryItem = {
      id: `hist-${i}`,
      symbol,
      type,
      detectedAt,
      spread,
      potentialProfit,
      estimatedProfit: potentialProfit * 0.85, // After fees
      buySource,
      sellSource,
      status,
      baseCurrency: type === 'tokens' ? 'USD' : 'BTC'
    };

    if (status === 'active') {
      item.expiresAt = detectedAt + 1800000; // 30 min from detection
    } else if (status === 'executed') {
      item.executedAt = detectedAt + 300000 + Math.random() * 900000; // 5-20 min after detection
      item.actualProfit = item.estimatedProfit * (0.8 + Math.random() * 0.4); // 80-120% of estimated
    }

    items.push(item);
  }

  return items.sort((a, b) => b.detectedAt - a.detectedAt);
};

export default function ArbitrageHistory() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('24h');

  const historyData = useMemo(() => generateHistoryData(), []);

  const filteredData = useMemo(() => {
    return historyData.filter(item => {
      const statusMatch = filterStatus === 'all' || item.status === filterStatus;
      const typeMatch = filterType === 'all' || item.type === filterType;
      
      // Timeframe filter
      const now = Date.now();
      let timeMatch = true;
      if (timeframe === '1h') {
        timeMatch = item.detectedAt > now - 3600000;
      } else if (timeframe === '6h') {
        timeMatch = item.detectedAt > now - 21600000;
      } else if (timeframe === '24h') {
        timeMatch = item.detectedAt > now - 86400000;
      }
      
      return statusMatch && typeMatch && timeMatch;
    });
  }, [historyData, filterStatus, filterType, timeframe]);

  const stats = useMemo(() => {
    const executed = filteredData.filter(item => item.status === 'executed');
    const totalPotential = filteredData.reduce((sum, item) => sum + item.potentialProfit, 0);
    const totalActual = executed.reduce((sum, item) => sum + (item.actualProfit || 0), 0);
    const successRate = filteredData.length > 0 ? (executed.length / filteredData.length) * 100 : 0;

    return {
      total: filteredData.length,
      executed: executed.length,
      expired: filteredData.filter(item => item.status === 'expired').length,
      active: filteredData.filter(item => item.status === 'active').length,
      totalPotential,
      totalActual,
      successRate
    };
  }, [filteredData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4 text-blue-400" />;
      case 'executed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'expired': return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/20 border-blue-500 text-blue-400';
      case 'executed': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'expired': return 'bg-gray-500/20 border-gray-500 text-gray-400';
      case 'failed': return 'bg-red-500/20 border-red-500 text-red-400';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-400';
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    if (currency === 'BTC') {
      return `₿${value.toFixed(8)}`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    
    if (diff < 3600000) { // Less than 1 hour
      return `${Math.round(diff / 60000)}min atrás`;
    } else if (diff < 86400000) { // Less than 24 hours
      return `${Math.round(diff / 3600000)}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-blue-400">{stats.total}</div>
                <div className="text-xs text-gray-400">Total Detectadas</div>
              </div>
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-green-400">{stats.executed}</div>
                <div className="text-xs text-gray-400">Executadas</div>
              </div>
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-orange-400">{stats.successRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">Taxa Sucesso</div>
              </div>
              <TrendingUp className="h-6 w-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-purple-400">₿{stats.totalActual.toFixed(6)}</div>
                <div className="text-xs text-gray-400">Lucro Real</div>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Período:</span>
          <div className="flex gap-1">
            {[
              { key: '1h', label: '1h' },
              { key: '6h', label: '6h' },
              { key: '24h', label: '24h' }
            ].map(period => (
              <Button
                key={period.key}
                size="sm"
                variant={timeframe === period.key ? 'default' : 'outline'}
                className={timeframe === period.key ? 'bg-orange-600' : 'border-gray-600 hover:border-orange-500'}
                onClick={() => setTimeframe(period.key)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Status:</span>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'active', label: 'Ativo' },
              { key: 'executed', label: 'Executado' },
              { key: 'expired', label: 'Expirado' }
            ].map(status => (
              <Button
                key={status.key}
                size="sm"
                variant={filterStatus === status.key ? 'default' : 'outline'}
                className={filterStatus === status.key ? 'bg-blue-600' : 'border-gray-600 hover:border-blue-500'}
                onClick={() => setFilterStatus(status.key)}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Tipo:</span>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'ordinals', label: 'Ordinals' },
              { key: 'runes', label: 'Runes' },
              { key: 'tokens', label: 'Tokens' }
            ].map(type => (
              <Button
                key={type.key}
                size="sm"
                variant={filterType === type.key ? 'default' : 'outline'}
                className={filterType === type.key ? 'bg-purple-600' : 'border-gray-600 hover:border-purple-500'}
                onClick={() => setFilterType(type.key)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* History Table */}
      <Card className="bg-black/50 border-gray-600">
        <CardHeader>
          <CardTitle className="text-gray-300 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Arbitragens • Últimas {filteredData.length} oportunidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3 text-gray-400 font-mono text-sm">Status</th>
                  <th className="text-left p-3 text-gray-400 font-mono text-sm">Ativo</th>
                  <th className="text-center p-3 text-gray-400 font-mono text-sm">Spread</th>
                  <th className="text-center p-3 text-gray-400 font-mono text-sm">Lucro Potencial</th>
                  <th className="text-center p-3 text-gray-400 font-mono text-sm">Lucro Real</th>
                  <th className="text-left p-3 text-gray-400 font-mono text-sm">Fonte → Destino</th>
                  <th className="text-center p-3 text-gray-400 font-mono text-sm">Detectado</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <Badge className={`${getStatusColor(item.status)} border text-xs`}>
                          {item.status.toUpperCase()}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          item.type === 'ordinals' ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
                          item.type === 'runes' ? 'bg-purple-500/20 border-purple-500 text-purple-400' :
                          'bg-blue-500/20 border-blue-500 text-blue-400'
                        } border text-xs`}>
                          {item.type.toUpperCase()}
                        </Badge>
                        <span className="text-white font-medium">{item.symbol}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-bold ${
                        item.spread >= 15 ? 'text-red-400' : 
                        item.spread >= 10 ? 'text-orange-400' : 'text-green-400'
                      }`}>
                        {item.spread.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-white font-mono">
                        {formatCurrency(item.potentialProfit, item.baseCurrency)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {item.actualProfit ? (
                        <span className="text-green-400 font-mono">
                          {formatCurrency(item.actualProfit, item.baseCurrency)}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-gray-300 text-sm">
                        {item.buySource} → {item.sellSource}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-gray-400 text-sm">
                        {formatTime(item.detectedAt)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}