'use client';

import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface TradingGridProps {
  children: React.ReactNode;
  className?: string;
}

export const TradingGrid: React.FC<TradingGridProps> = ({ 
  children, 
  className = "" 
}) => {
  const layouts = {
    lg: [
      { i: 'chart', x: 0, y: 0, w: 8, h: 6, minW: 4, minH: 4 },
      { i: 'orderbook', x: 8, y: 0, w: 4, h: 6, minW: 2, minH: 4 },
      { i: 'trades', x: 0, y: 6, w: 6, h: 4, minW: 3, minH: 3 },
      { i: 'portfolio', x: 6, y: 6, w: 6, h: 4, minW: 3, minH: 3 },
      { i: 'alerts', x: 0, y: 10, w: 12, h: 2, minW: 6, minH: 2 },
      { i: 'neural', x: 0, y: 12, w: 6, h: 4, minW: 3, minH: 3 },
      { i: 'arbitrage', x: 6, y: 12, w: 6, h: 4, minW: 3, minH: 3 }
    ],
    md: [
      { i: 'chart', x: 0, y: 0, w: 6, h: 6, minW: 3, minH: 4 },
      { i: 'orderbook', x: 6, y: 0, w: 4, h: 6, minW: 2, minH: 4 },
      { i: 'trades', x: 0, y: 6, w: 5, h: 4, minW: 3, minH: 3 },
      { i: 'portfolio', x: 5, y: 6, w: 5, h: 4, minW: 3, minH: 3 },
      { i: 'alerts', x: 0, y: 10, w: 10, h: 2, minW: 5, minH: 2 },
      { i: 'neural', x: 0, y: 12, w: 5, h: 4, minW: 3, minH: 3 },
      { i: 'arbitrage', x: 5, y: 12, w: 5, h: 4, minW: 3, minH: 3 }
    ],
    sm: [
      { i: 'chart', x: 0, y: 0, w: 6, h: 6, minW: 3, minH: 4 },
      { i: 'orderbook', x: 0, y: 6, w: 6, h: 4, minW: 3, minH: 3 },
      { i: 'trades', x: 0, y: 10, w: 6, h: 4, minW: 3, minH: 3 },
      { i: 'portfolio', x: 0, y: 14, w: 6, h: 4, minW: 3, minH: 3 },
      { i: 'alerts', x: 0, y: 18, w: 6, h: 2, minW: 3, minH: 2 },
      { i: 'neural', x: 0, y: 20, w: 6, h: 4, minW: 3, minH: 3 },
      { i: 'arbitrage', x: 0, y: 24, w: 6, h: 4, minW: 3, minH: 3 }
    ]
  };

  const breakpoints = { 
    lg: 1200, 
    md: 996, 
    sm: 768, 
    xs: 480, 
    xxs: 0 
  };
  
  const cols = { 
    lg: 12, 
    md: 10, 
    sm: 6, 
    xs: 4, 
    xxs: 2 
  };

  return (
    <div className={`terminal-background min-h-screen ${className}`}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={60}
        isDraggable={true}
        isResizable={true}
        containerPadding={[10, 10]}
        margin={[10, 10]}
        draggableHandle=".grid-handle"
        resizeHandles={['se']}
        useCSSTransforms={true}
        compactType={'vertical'}
        preventCollision={false}
      >
        {children}
      </ResponsiveGridLayout>
    </div>
  );
};

// Grid Panel Component for consistent styling
interface GridPanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const GridPanel: React.FC<GridPanelProps> = ({ 
  id, 
  title, 
  children, 
  className = "",
  actions
}) => {
  return (
    <div 
      key={id} 
      className={`terminal-border bg-bloomberg-black-800 rounded-lg overflow-hidden ${className}`}
    >
      {/* Panel Header */}
      <div className="grid-handle flex items-center justify-between p-3 bg-bloomberg-black-700 border-b border-bloomberg-orange/30 cursor-move">
        <h3 className="terminal-text text-sm font-semibold uppercase tracking-wider">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {actions}
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-bloomberg-red rounded-full"></div>
            <div className="w-2 h-2 bg-bloomberg-yellow rounded-full"></div>
            <div className="w-2 h-2 bg-bloomberg-green rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Panel Content */}
      <div className="p-4 h-full overflow-auto">
        {children}
      </div>
    </div>
  );
};

// Bloomberg Terminal Header Component
export const TerminalHeader: React.FC = () => {
  return (
    <header className="bg-bloomberg-black border-b border-bloomberg-orange/30 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-bloomberg-orange font-terminal text-xl font-bold tracking-wider">
            CYPHER ORDI-FUTURE-V3
          </h1>
          <div className="text-bloomberg-orange/60 text-xs font-terminal">
            PROFESSIONAL TRADING TERMINAL
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-bloomberg-orange/80 text-xs font-terminal">
            {new Date().toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-bloomberg-green rounded-full animate-pulse"></div>
            <span className="text-bloomberg-green text-xs font-terminal">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Tab Navigation Component
interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const tabs = [
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'ordinals', label: 'ORDINALS' },
    { id: 'runes', label: 'RUNES' },
    { id: 'trading', label: 'TRADING BOT' },
    { id: 'arbitrage', label: 'ARBITRAGE' },
    { id: 'portfolio', label: 'PORTFOLIO' }
  ];

  return (
    <nav className="bg-bloomberg-black-800 border-b border-bloomberg-orange/30 px-6">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-1 text-xs font-terminal font-semibold tracking-wider transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-bloomberg-orange border-bloomberg-orange'
                : 'text-bloomberg-orange/60 border-transparent hover:text-bloomberg-orange/80 hover:border-bloomberg-orange/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};