'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Plus, 
  X,
  TrendingUp,
  TrendingDown,
  Target,
  Volume2,
  Mail
} from 'lucide-react';

interface Alert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'change';
  value: number;
  currentValue: number;
  type: 'price' | 'volume' | 'change';
  active: boolean;
  triggered: boolean;
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      symbol: 'BTC',
      condition: 'above',
      value: 105000,
      currentValue: 104500,
      type: 'price',
      active: true,
      triggered: false
    },
    {
      id: '2',
      symbol: 'ETH',
      condition: 'change',
      value: 5,
      currentValue: -1.23,
      type: 'change',
      active: true,
      triggered: false
    },
    {
      id: '3',
      symbol: 'SOL',
      condition: 'below',
      value: 95,
      currentValue: 98.75,
      type: 'price',
      active: false,
      triggered: true
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'price':
        return <Target className="w-4 h-4" />;
      case 'volume':
        return <Volume2 className="w-4 h-4" />;
      case 'change':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getConditionIcon = (condition: Alert['condition']) => {
    switch (condition) {
      case 'above':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'below':
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      case 'change':
        return <Target className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const getAlertStatus = (alert: Alert): 'active' | 'triggered' | 'inactive' => {
    if (alert.triggered) return 'triggered';
    if (alert.active) return 'active';
    return 'inactive';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'triggered':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatCondition = (alert: Alert): string => {
    if (alert.type === 'change') {
      return `${alert.value}% change`;
    }
    return `${alert.condition} $${alert.value.toLocaleString()}`;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Price Alerts</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="h-6 w-6"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="p-3 bg-gray-800/30 border-gray-700">
            <div className="space-y-2">
              <Input 
                placeholder="Symbol (e.g., BTC)" 
                className="h-8 text-sm bg-gray-800 border-gray-600"
              />
              <div className="flex gap-2">
                <Input 
                  placeholder="Price" 
                  type="number"
                  className="h-8 text-sm bg-gray-800 border-gray-600"
                />
                <Button size="sm" className="h-8 px-3">
                  Create
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Alerts List */}
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <Bell className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active alerts</p>
          </div>
        ) : (
          alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 bg-gray-800/30 rounded-lg border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.type)}
                  <span className="font-medium">{alert.symbol}</span>
                  <Badge className={`text-xs ${getStatusColor(getAlertStatus(alert))}`}>
                    {getAlertStatus(alert)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleAlert(alert.id)}
                    className="h-6 w-6"
                  >
                    <Bell className={`w-3 h-3 ${alert.active ? 'text-green-400' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAlert(alert.id)}
                    className="h-6 w-6"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getConditionIcon(alert.condition)}
                  <span className="text-gray-400">
                    {formatCondition(alert)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {alert.type === 'change' ? (
                      `${alert.currentValue > 0 ? '+' : ''}${alert.currentValue.toFixed(2)}%`
                    ) : (
                      `$${alert.currentValue.toLocaleString()}`
                    )}
                  </p>
                  {alert.type === 'price' && (
                    <p className="text-xs text-gray-400">
                      {alert.condition === 'above' ? 
                        `$${(alert.value - alert.currentValue).toLocaleString()} to go` :
                        `$${(alert.currentValue - alert.value).toLocaleString()} below`
                      }
                    </p>
                  )}
                </div>
              </div>

              {alert.triggered && (
                <div className="mt-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-300">Alert triggered!</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Notification Settings */}
      <Card className="p-3 bg-gray-800/30 border-gray-700">
        <h5 className="text-sm font-medium mb-2">Notification Methods</h5>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-3 h-3 text-blue-400" />
              <span className="text-xs">Push Notifications</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 text-xs">
              Enabled
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-3 h-3 text-purple-400" />
              <span className="text-xs">Sound Alerts</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 text-xs">
              Enabled
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-orange-400" />
              <span className="text-xs">Email Alerts</span>
            </div>
            <Badge className="bg-gray-500/20 text-gray-400 text-xs">
              Disabled
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}