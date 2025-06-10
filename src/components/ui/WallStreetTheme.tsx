'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface MarketTickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface PriceCardProps {
  title: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
}

interface ExecutiveCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

// Market Ticker Tape Component
export const MarketTickerTape: React.FC<{ items: MarketTickerItem[] }> = ({ items }) => {
  const duplicatedItems = [...items, ...items]; // Duplicate for seamless loop

  return (
    <div className="ws-ticker-tape">
      <div className="ws-ticker-content">
        <div className="ws-ticker-track">
          {duplicatedItems.map((item, index) => (
            <div key={index} className="ws-ticker-item">
              <span className="ws-ticker-symbol">{item.symbol}</span>
              <span className="ws-ticker-price">${item.price.toLocaleString()}</span>
              <span
                className={`ws-ticker-change ${
                  item.change >= 0 ? 'ws-positive' : 'ws-negative'
                }`}
              >
                {item.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {item.changePercent.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Stock-style Price Card Component
export const StockPriceCard: React.FC<PriceCardProps> = ({
  title,
  value,
  change = 0,
  changePercent = 0,
  prefix = '',
  suffix = '',
  icon,
}) => {
  const isPositive = change >= 0;

  return (
    <div className="ws-price-card ws-fade-in">
      <div className="ws-price-card-header">
        <h3 className="ws-price-card-title">{title}</h3>
        {icon && <div className="ws-price-card-icon">{icon}</div>}
      </div>
      
      <div className="ws-price-card-body">
        <div className="ws-price-value">
          {prefix}
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix}
        </div>
        
        {(change !== 0 || changePercent !== 0) && (
          <div className={`ws-price-change ${isPositive ? 'ws-positive' : 'ws-negative'}`}>
            <div className="ws-price-change-icon">
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
            <span className="ws-price-change-amount">
              {isPositive ? '+' : ''}{change.toLocaleString()}
            </span>
            <span className="ws-price-change-percent">
              ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Executive Dashboard Card Component
export const ExecutiveCard: React.FC<ExecutiveCardProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`ws-executive-card ws-fade-in ${className}`}>
      <div className="ws-executive-card-header">
        <h2 className="ws-executive-card-title">{title}</h2>
        <div className="ws-executive-card-line" />
      </div>
      <div className="ws-executive-card-content">{children}</div>
    </div>
  );
};

// Professional Chart Container
export const ChartContainer: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`ws-chart-container ${className}`}>
      <div className="ws-chart-header">
        <div>
          <h3 className="ws-chart-title">{title}</h3>
          {subtitle && <p className="ws-chart-subtitle">{subtitle}</p>}
        </div>
        <Activity className="ws-chart-icon" size={20} />
      </div>
      <div className="ws-chart-content">{children}</div>
    </div>
  );
};

// Financial Metric Component
export const FinancialMetric: React.FC<{
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
}> = ({ label, value, trend = 'neutral', prefix = '', suffix = '' }) => {
  return (
    <div className="ws-metric">
      <div className="ws-metric-label">{label}</div>
      <div className="ws-metric-value">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix}
        {trend !== 'neutral' && (
          <span className={`ws-metric-trend ${trend === 'up' ? 'ws-positive' : 'ws-negative'}`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          </span>
        )}
      </div>
    </div>
  );
};

// Executive Summary Grid
export const ExecutiveSummaryGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="ws-executive-grid">{children}</div>;
};

// Trading Button Component
export const TradingButton: React.FC<{
  variant?: 'buy' | 'sell' | 'neutral';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ variant = 'neutral', children, onClick, disabled = false, size = 'md', className = '' }) => {
  return (
    <button
      className={`ws-trading-button ws-trading-button-${variant} ws-trading-button-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Data Table Component
export const FinancialDataTable: React.FC<{
  headers: string[];
  data: Array<Record<string, any>>;
  className?: string;
}> = ({ headers, data, className = '' }) => {
  return (
    <div className={`ws-data-table-container ${className}`}>
      <table className="ws-data-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="ws-data-table-header">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="ws-data-table-row">
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex} className="ws-data-table-cell">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Market Status Indicator
export const MarketStatusIndicator: React.FC<{
  status: 'open' | 'closed' | 'pre-market' | 'after-hours';
}> = ({ status }) => {
  const statusConfig = {
    open: { color: 'ws-status-open', text: 'Market Open' },
    closed: { color: 'ws-status-closed', text: 'Market Closed' },
    'pre-market': { color: 'ws-status-pre', text: 'Pre-Market' },
    'after-hours': { color: 'ws-status-after', text: 'After Hours' },
  };

  const config = statusConfig[status];

  return (
    <div className={`ws-market-status ${config.color}`}>
      <div className="ws-status-dot" />
      <span className="ws-status-text">{config.text}</span>
    </div>
  );
};