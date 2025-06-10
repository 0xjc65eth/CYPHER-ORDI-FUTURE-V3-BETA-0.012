'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  Volume2,
  VolumeX,
  Settings,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Alert {
  id: string;
  symbol: string;
  type: 'price' | 'volume' | 'technical';
  condition: 'above' | 'below' | 'crosses';
  value: number;
  currentValue: number;
  isActive: boolean;
  triggered: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  message: string;
}

interface Signal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell' | 'hold';
  strength: 'weak' | 'moderate' | 'strong';
  indicators: string[];
  confidence: number;
  price: number;
  timestamp: Date;
  timeframe: string;
}

export const AlertsAndSignals: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load initial data
    loadAlerts();
    loadSignals();
    
    // Set up real-time monitoring
    const interval = setInterval(() => {
      checkAlerts();
      updateSignals();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const loadAlerts = () => {
    // Mock data - in real app, load from API/localStorage
    const mockAlerts: Alert[] = [
      {
        id: '1',
        symbol: 'BTCUSDT',
        type: 'price',
        condition: 'above',
        value: 110000,
        currentValue: 108750,
        isActive: true,
        triggered: false,
        createdAt: new Date(Date.now() - 3600000),
        message: 'BTC price above $110,000'
      },
      {
        id: '2',
        symbol: 'ETHUSDT',
        type: 'price',
        condition: 'below',
        value: 3000,
        currentValue: 3245,
        isActive: true,
        triggered: false,
        createdAt: new Date(Date.now() - 7200000),
        message: 'ETH price below $3,000'
      },
      {
        id: '3',
        symbol: 'BTCUSDT',
        type: 'volume',
        condition: 'above',
        value: 1000,
        currentValue: 850,
        isActive: true,
        triggered: false,
        createdAt: new Date(Date.now() - 1800000),
        message: 'BTC volume spike above 1000 BTC'
      }
    ];
    setAlerts(mockAlerts);
  };

  const loadSignals = () => {
    // Mock trading signals
    const mockSignals: Signal[] = [
      {
        id: '1',
        symbol: 'BTCUSDT',
        type: 'buy',
        strength: 'strong',
        indicators: ['RSI Oversold', 'MACD Bullish Cross', 'Support Level'],
        confidence: 85,
        price: 108750,
        timestamp: new Date(Date.now() - 300000),
        timeframe: '1h'
      },
      {
        id: '2',
        symbol: 'ETHUSDT',
        type: 'sell',
        strength: 'moderate',
        indicators: ['RSI Overbought', 'Resistance Level'],
        confidence: 72,
        price: 3245,
        timestamp: new Date(Date.now() - 600000),
        timeframe: '4h'
      },
      {
        id: '3',
        symbol: 'SOLUSDT',
        type: 'hold',
        strength: 'weak',
        indicators: ['Sideways Trend', 'Low Volume'],
        confidence: 45,
        price: 185,
        timestamp: new Date(Date.now() - 900000),
        timeframe: '1d'
      }
    ];
    setSignals(mockSignals);
  };

  const checkAlerts = async () => {
    // In real app, fetch current prices and check conditions
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => {
        const shouldTrigger = 
          (alert.condition === 'above' && alert.currentValue >= alert.value) ||
          (alert.condition === 'below' && alert.currentValue <= alert.value);

        if (shouldTrigger && !alert.triggered && alert.isActive) {
          // Trigger alert
          triggerAlert(alert);
          return { ...alert, triggered: true, triggeredAt: new Date() };
        }
        return alert;
      })
    );
  };

  const updateSignals = () => {
    // Mock signal updates - in real app, get from AI/ML service
    const newSignal: Signal = {
      id: Date.now().toString(),
      symbol: 'BTCUSDT',
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      strength: ['weak', 'moderate', 'strong'][Math.floor(Math.random() * 3)] as any,
      indicators: ['RSI', 'MACD', 'Bollinger Bands'],
      confidence: Math.floor(Math.random() * 40) + 60,
      price: 108750 + (Math.random() - 0.5) * 1000,
      timestamp: new Date(),
      timeframe: '1h'
    };

    // Only add if significantly different from last signal
    setSignals(prev => [newSignal, ...prev.slice(0, 4)]);
  };

  const triggerAlert = (alert: Alert) => {
    // Play sound if enabled
    if (soundEnabled) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {}); // Ignore errors
    }

    // Show toast notification
    toast({
      title: '🚨 Alert Triggered!',
      description: alert.message,
      duration: 5000,
    });

    // Send browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification('CYPHER ORDI Alert', {
        body: alert.message,
        icon: '/icons/icon-192x192.png'
      });
    }
  };

  const addAlert = (alertData: Partial<Alert>) => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      ...alertData,
      isActive: true,
      triggered: false,
      createdAt: new Date(),
    } as Alert;
    
    setAlerts(prev => [...prev, newAlert]);
    setShowAddAlert(false);
    
    toast({
      title: 'Alert Created',
      description: `Alert for ${newAlert.symbol} has been set`,
    });
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast({
      title: 'Alert Deleted',
      description: 'Alert has been removed',
    });
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'sell': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-orange-500" />
          Alerts & Signals
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => setShowAddAlert(true)}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Alert
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Active Alerts ({alerts.filter(a => a.isActive).length})
            </h3>
            
            <div className="space-y-3">
              {alerts.map(alert => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.triggered 
                      ? 'bg-green-900/20 border-green-600/30' 
                      : alert.isActive 
                        ? 'bg-gray-700/50 border-gray-600/50' 
                        : 'bg-gray-800/50 border-gray-700/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {alert.symbol}
                      </Badge>
                      <Badge 
                        variant={alert.triggered ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {alert.triggered ? 'Triggered' : alert.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAlert(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2">{alert.message}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      Target: ${alert.value.toLocaleString()} | 
                      Current: ${alert.currentValue.toLocaleString()}
                    </span>
                    <span>
                      {alert.triggered ? 'Triggered' : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
              
              {alerts.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No alerts configured</p>
                  <p className="text-xs">Create your first alert to get started</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Trading Signals */}
        <Card className="bg-gray-800 border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              AI Trading Signals
            </h3>
            
            <div className="space-y-3">
              {signals.map(signal => (
                <div 
                  key={signal.id}
                  className={`p-3 rounded-lg border ${getSignalColor(signal.type)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {signal.symbol}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {signal.type === 'buy' ? 
                          <TrendingUp className="w-4 h-4" /> : 
                          signal.type === 'sell' ? 
                          <TrendingDown className="w-4 h-4" /> : 
                          <div className="w-4 h-4 border border-current rounded-full" />
                        }
                        <span className="text-sm font-medium uppercase">
                          {signal.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${getStrengthColor(signal.strength)}`}>
                        {signal.strength}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {signal.confidence}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-2">
                    Indicators: {signal.indicators.join(', ')}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span>Price: ${signal.price.toLocaleString()}</span>
                    <span>{signal.timeframe} • {signal.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              
              {signals.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No signals available</p>
                  <p className="text-xs">AI signals will appear here</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};