'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { DashboardIcons } from '@/lib/icons/icon-system';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

export function MetricCard({ title, value, change, icon, color = '#3B82F6', className }: MetricCardProps) {
  return (
    <div className={cn(
      "bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4",
      "hover:bg-gray-900/70 transition-all duration-200",
      "relative overflow-hidden group",
      className
    )}>
      {/* Background glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${color}40 0%, transparent 70%)`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">{title}</span>
          {icon && <div style={{ color }}>{icon}</div>}
        </div>
        
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white">{value}</span>
          {change !== undefined && (
            <span className={cn(
              "text-sm font-medium flex items-center",
              change >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {change >= 0 ? (
                <DashboardIcons.priceUp.icon className="w-3 h-3 mr-0.5" />
              ) : (
                <DashboardIcons.priceDown.icon className="w-3 h-3 mr-0.5" />
              )}
              {Math.abs(change).toFixed(2)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, icon, action, className }: SectionHeaderProps) {
  return (
    <div className={cn(
      "flex items-center justify-between mb-4 pb-2 border-b border-gray-800",
      className
    )}>
      <h3 className="text-lg font-semibold text-white flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </h3>
      {action && <div>{action}</div>}
    </div>
  );
}

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning';
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusConfig = {
    online: { color: 'bg-green-500', text: 'text-green-400' },
    offline: { color: 'bg-red-500', text: 'text-red-400' },
    warning: { color: 'bg-yellow-500', text: 'text-yellow-400' }
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center", className)}>
      <span className={cn(
        "w-2 h-2 rounded-full mr-2",
        config.color,
        status === 'online' && 'animate-pulse'
      )} />
      {label && <span className={cn("text-sm", config.text)}>{label}</span>}
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  color = '#3B82F6', 
  showPercentage = true,
  className 
}: ProgressBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-white">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}CC 0%, ${color} 100%)`
          }}
        />
      </div>
    </div>
  );
}

interface ChartContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  toolbar?: React.ReactNode;
}

export function ChartContainer({ title, children, className, toolbar }: ChartContainerProps) {
  return (
    <div className={cn(
      "bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg",
      className
    )}>
      {(title || toolbar) && (
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {title && <h4 className="text-sm font-medium text-white">{title}</h4>}
          {toolbar && <div className="flex items-center space-x-2">{toolbar}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

// Professional color palette for consistent theming
export const DashboardColors = {
  primary: '#F97316',    // Orange
  secondary: '#8B5CF6',  // Purple
  success: '#10B981',    // Green
  danger: '#EF4444',     // Red
  warning: '#F59E0B',    // Amber
  info: '#3B82F6',       // Blue
  neutral: '#6B7280',    // Gray
  
  // Chart colors
  chart: {
    green: '#10B981',
    red: '#EF4444',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    orange: '#F97316',
    yellow: '#F59E0B',
    pink: '#EC4899',
    teal: '#14B8A6'
  }
};