'use client';

import React, { useState, useEffect } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabsFixedProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabsFixed({ tabs, activeTab, onTabChange, className = '' }: TabsFixedProps) {
  // Force re-render on mount to ensure event handlers are attached
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <div
            key={tab.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              console.log('🚀 Tab clicked directly:', tab.id);
              onTabChange(tab.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTabChange(tab.id);
              }
            }}
            className={`
              flex items-center gap-2 px-4 py-3 
              border-b-2 transition-colors cursor-pointer
              select-none touch-manipulation
              ${activeTab === tab.id
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-400 hover:text-white'
              }
            `}
            style={{
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
              touchAction: 'manipulation'
            }}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}