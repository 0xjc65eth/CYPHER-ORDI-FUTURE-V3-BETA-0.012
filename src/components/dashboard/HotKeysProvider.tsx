'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Keyboard, 
  X, 
  Zap, 
  BarChart3, 
  Wallet, 
  Brain, 
  TrendingUp,
  RefreshCw,
  Settings,
  Search,
  Command
} from 'lucide-react';

interface HotKey {
  key: string;
  description: string;
  action: () => void;
  category: 'navigation' | 'trading' | 'dashboard' | 'system';
}

interface HotKeysContextType {
  showHelp: boolean;
  toggleHelp: () => void;
  hotkeys: HotKey[];
}

const HotKeysContext = createContext<HotKeysContextType | undefined>(undefined);

export function useHotKeysContext() {
  const context = useContext(HotKeysContext);
  if (!context) {
    throw new Error('useHotKeysContext must be used within HotKeysProvider');
  }
  return context;
}

interface HotKeysProviderProps {
  children: React.ReactNode;
  onNavigate?: (tab: string) => void;
  onRefresh?: () => void;
  onToggleTheme?: () => void;
  onQuickTrade?: () => void;
  onConnectWallet?: () => void;
}

export function HotKeysProvider({ 
  children, 
  onNavigate,
  onRefresh,
  onToggleTheme,
  onQuickTrade,
  onConnectWallet
}: HotKeysProviderProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [lastPressed, setLastPressed] = useState<string>('');

  const toggleHelp = () => setShowHelp(!showHelp);

  // Define all hotkeys
  const hotkeys: HotKey[] = [
    // Navigation
    {
      key: 'g o',
      description: 'Go to Overview',
      action: () => onNavigate?.('overview'),
      category: 'navigation'
    },
    {
      key: 'g p',
      description: 'Go to Portfolio',
      action: () => onNavigate?.('portfolio'),
      category: 'navigation'
    },
    {
      key: 'g c',
      description: 'Go to Charts',
      action: () => onNavigate?.('charts'),
      category: 'navigation'
    },
    {
      key: 'g a',
      description: 'Go to AI Status',
      action: () => onNavigate?.('ai'),
      category: 'navigation'
    },
    {
      key: 'g t',
      description: 'Go to Trading',
      action: () => onNavigate?.('trading'),
      category: 'navigation'
    },
    // Trading
    {
      key: 'ctrl+t',
      description: 'Quick Trade',
      action: () => onQuickTrade?.(),
      category: 'trading'
    },
    {
      key: 'ctrl+w',
      description: 'Connect Wallet',
      action: () => onConnectWallet?.(),
      category: 'trading'
    },
    // Dashboard
    {
      key: 'ctrl+r',
      description: 'Refresh Data',
      action: () => onRefresh?.(),
      category: 'dashboard'
    },
    {
      key: 'ctrl+shift+d',
      description: 'Toggle Dark/Light Mode',
      action: () => onToggleTheme?.(),
      category: 'dashboard'
    },
    // System
    {
      key: '?',
      description: 'Show/Hide Help',
      action: toggleHelp,
      category: 'system'
    },
    {
      key: 'escape',
      description: 'Close Modals',
      action: () => setShowHelp(false),
      category: 'system'
    }
  ];

  // Register all hotkeys using individual useHotkeys calls
  useHotkeys('g o', () => { setLastPressed('g o'); onNavigate?.('overview'); setTimeout(() => setLastPressed(''), 2000); });
  useHotkeys('g p', () => { setLastPressed('g p'); onNavigate?.('portfolio'); setTimeout(() => setLastPressed(''), 2000); });
  useHotkeys('g c', () => { setLastPressed('g c'); onNavigate?.('charts'); setTimeout(() => setLastPressed(''), 2000); });
  useHotkeys('g a', () => { setLastPressed('g a'); onNavigate?.('ai'); setTimeout(() => setLastPressed(''), 2000); });
  useHotkeys('g t', () => { setLastPressed('g t'); onNavigate?.('trading'); setTimeout(() => setLastPressed(''), 2000); });
  useHotkeys('ctrl+t', () => { setLastPressed('ctrl+t'); onQuickTrade?.(); setTimeout(() => setLastPressed(''), 2000); });
  useHotkeys('ctrl+w', () => { setLastPressed('ctrl+w'); onConnectWallet?.(); setTimeout(() => setLastPressed(''), 2000); });
  useHotkeys('ctrl+r', () => { setLastPressed('ctrl+r'); onRefresh?.(); setTimeout(() => setLastPressed(''), 2000); });
  useHotkeys('ctrl+shift+d', () => { setLastPressed('ctrl+shift+d'); onToggleTheme?.(); setTimeout(() => setLastPressed(''), 2000); });
  useHotkeys('?', () => { setLastPressed('?'); toggleHelp(); setTimeout(() => setLastPressed(''), 2000); });
  useHotkeys('escape', () => { setLastPressed('escape'); setShowHelp(false); setTimeout(() => setLastPressed(''), 2000); });

  const contextValue: HotKeysContextType = {
    showHelp,
    toggleHelp,
    hotkeys
  };

  return (
    <HotKeysContext.Provider value={contextValue}>
      {children}
      
      {/* Hotkey Help Modal */}
      {showHelp && <HotKeyHelpModal onClose={() => setShowHelp(false)} hotkeys={hotkeys} />}
      
      {/* Last Pressed Key Indicator */}
      {lastPressed && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="bg-gray-900 border-gray-700 p-3">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-green-500" />
              <Badge className="bg-green-600 text-white font-mono">
                {lastPressed}
              </Badge>
            </div>
          </Card>
        </div>
      )}
      
      {/* Hotkey Indicator */}
      <div className="fixed bottom-4 left-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleHelp}
          className="bg-gray-900/80 backdrop-blur border-gray-700 text-gray-300 hover:text-white"
        >
          <Command className="w-4 h-4 mr-1" />
          Press ? for shortcuts
        </Button>
      </div>
    </HotKeysContext.Provider>
  );
}

interface HotKeyHelpModalProps {
  onClose: () => void;
  hotkeys: HotKey[];
}

function HotKeyHelpModal({ onClose, hotkeys }: HotKeyHelpModalProps) {
  const categorizedHotkeys = hotkeys.reduce((acc, hotkey) => {
    if (!acc[hotkey.category]) {
      acc[hotkey.category] = [];
    }
    acc[hotkey.category].push(hotkey);
    return acc;
  }, {} as Record<string, HotKey[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return <BarChart3 className="w-4 h-4" />;
      case 'trading': return <TrendingUp className="w-4 h-4" />;
      case 'dashboard': return <RefreshCw className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Keyboard className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return 'text-blue-400';
      case 'trading': return 'text-green-400';
      case 'dashboard': return 'text-purple-400';
      case 'system': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  // Close on escape key
  useHotkeys('escape', onClose, { enableOnFormTags: true });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Keyboard className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
                <p className="text-sm text-gray-400">Master your workflow with these hotkeys</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(categorizedHotkeys).map(([category, keys]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
                  <div className={getCategoryColor(category)}>
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {category}
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {keys.map((hotkey, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                      <span className="text-sm text-gray-300">{hotkey.description}</span>
                      <Badge variant="outline" className="bg-gray-700 border-gray-600 font-mono text-xs">
                        {hotkey.key.replace('ctrl+', '⌘ ').replace('shift+', '⇧ ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Pro Tips</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Most shortcuts work globally across the dashboard</li>
                  <li>• Use &lsquo;g&rsquo; followed by a letter for quick navigation</li>
                  <li>• Hold Ctrl for action shortcuts like trade and refresh</li>
                  <li>• Press Escape to close any modal or help screen</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Got it! Let&rsquo;s go 🚀
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}