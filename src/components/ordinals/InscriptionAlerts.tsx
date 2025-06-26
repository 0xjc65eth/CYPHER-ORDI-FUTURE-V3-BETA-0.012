'use client';

import React from 'react';
import { useTradingStore } from '@/stores/trading-store';

export const InscriptionAlerts: React.FC = () => {
  const { alerts, markAlertRead, clearAlerts } = useTradingStore();
  
  // Filter for inscription-related alerts
  const inscriptionAlerts = alerts.filter(alert => alert.type === 'inscription');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'border-bloomberg-green text-bloomberg-green bg-bloomberg-green/10';
      case 'warning': return 'border-bloomberg-yellow text-bloomberg-yellow bg-bloomberg-yellow/10';
      case 'error': return 'border-bloomberg-red text-bloomberg-red bg-bloomberg-red/10';
      default: return 'border-bloomberg-blue text-bloomberg-blue bg-bloomberg-blue/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      default: return 'ℹ';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-terminal text-bloomberg-orange">
          Recent Alerts ({inscriptionAlerts.filter(a => !a.read).length} unread)
        </div>
        {inscriptionAlerts.length > 0 && (
          <button
            onClick={clearAlerts}
            className="text-xs text-bloomberg-orange/60 hover:text-bloomberg-orange transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Alerts List */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {inscriptionAlerts.slice(0, 10).map((alert) => (
          <div
            key={alert.id}
            onClick={() => markAlertRead(alert.id)}
            className={`cursor-pointer p-3 rounded border transition-all duration-200 ${getSeverityColor(alert.severity)} ${
              !alert.read ? 'opacity-100' : 'opacity-60'
            } hover:opacity-80`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs mt-0.5">
                {getSeverityIcon(alert.severity)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-terminal font-semibold truncate">
                    {alert.title}
                  </h4>
                  {!alert.read && (
                    <div className="w-2 h-2 bg-current rounded-full flex-shrink-0"></div>
                  )}
                </div>
                
                <p className="text-xs opacity-80 mt-1 line-clamp-2">
                  {alert.message}
                </p>
                
                <div className="text-xs opacity-60 mt-2">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {inscriptionAlerts.length === 0 && (
          <div className="text-center py-8 text-bloomberg-orange/60">
            <div className="text-lg font-terminal">No alerts yet</div>
            <div className="text-sm">Inscription alerts will appear here</div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-bloomberg-orange/20">
        <div className="text-xs text-bloomberg-orange/60 mb-2">Alert Settings</div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-bloomberg-orange/80">
            <input 
              type="checkbox" 
              defaultChecked 
              className="rounded border-bloomberg-orange/30 bg-bloomberg-black-700 text-bloomberg-orange focus:ring-bloomberg-orange/50"
            />
            Rare inscriptions (Epic & Legendary)
          </label>
          
          <label className="flex items-center gap-2 text-xs text-bloomberg-orange/80">
            <input 
              type="checkbox" 
              defaultChecked 
              className="rounded border-bloomberg-orange/30 bg-bloomberg-black-700 text-bloomberg-orange focus:ring-bloomberg-orange/50"
            />
            Price movements (±10%)
          </label>
          
          <label className="flex items-center gap-2 text-xs text-bloomberg-orange/80">
            <input 
              type="checkbox" 
              className="rounded border-bloomberg-orange/30 bg-bloomberg-black-700 text-bloomberg-orange focus:ring-bloomberg-orange/50"
            />
            New collections
          </label>
          
          <label className="flex items-center gap-2 text-xs text-bloomberg-orange/80">
            <input 
              type="checkbox" 
              className="rounded border-bloomberg-orange/30 bg-bloomberg-black-700 text-bloomberg-orange focus:ring-bloomberg-orange/50"
            />
            High volume activity
          </label>
        </div>
      </div>
    </div>
  );
};