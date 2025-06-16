/**
 * 🔔 CYPHER AI Notification System
 * Advanced notification system for AI trading alerts
 */

import { EventEmitter } from 'events';

export interface NotificationConfig {
  enableSound?: boolean;
  enablePush?: boolean;
  riskAlerts?: boolean;
  tradeExecutions?: boolean;
  emergencyStops?: boolean;
}

export interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
}

export class CypherAINotificationSystem extends EventEmitter {
  private config: Required<NotificationConfig>;
  
  constructor(config: NotificationConfig = {}) {
    super();
    this.config = {
      enableSound: config.enableSound ?? true,
      enablePush: config.enablePush ?? true,
      riskAlerts: config.riskAlerts ?? true,
      tradeExecutions: config.tradeExecutions ?? true,
      emergencyStops: config.emergencyStops ?? true
    };
  }

  async notifySignalGenerated(signal: TradingSignal): Promise<void> {
    const message = `${signal.action} Signal: ${signal.symbol} at $${signal.price}`;
    this.emit('notification', {
      type: signal.action === 'BUY' ? 'success' : signal.action === 'SELL' ? 'warning' : 'info',
      title: `${signal.action} Signal Generated`,
      message,
      priority: signal.confidence > 0.8 ? 'high' : 'medium'
    });
  }

  async notifyTradeExecuted(trade: any): Promise<void> {
    this.emit('notification', {
      type: 'success',
      title: 'Trade Executed',
      message: `${trade.side} ${trade.amount} ${trade.symbol} at ${trade.price}`,
      priority: 'high'
    });
  }

  async notifyEmergencyStop(reason: string): Promise<void> {
    this.emit('notification', {
      type: 'error',
      title: 'Emergency Stop Activated',
      message: reason,
      priority: 'high'
    });
  }

  async notifyRiskAlert(alert: any): Promise<void> {
    this.emit('notification', {
      type: 'warning',
      title: 'Risk Alert',
      message: alert.message,
      priority: alert.severity
    });
  }
}

export default CypherAINotificationSystem;
