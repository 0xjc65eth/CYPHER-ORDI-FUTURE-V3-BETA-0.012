'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Volume2, 
  Target,
  AlertTriangle,
  RefreshCw,
  Maximize2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Filter
} from 'lucide-react';
import styles from '../../styles/WallStreet.module.css';

interface RuneData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  totalSupply: number;
  circulatingSupply: number;
  mintProgress: number;
  status: 'active' | 'minting' | 'completed' | 'premint';
  divisibility: number;
  etching: string;
  spacedName: string;
  lastUpdate: number;
}

interface TerminalCommand {
  timestamp: number;
  command: string;
  output: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface RunesTerminalProps {
  height?: number;
  maxLines?: number;
  autoScroll?: boolean;
  showFilters?: boolean;
  className?: string;
}

export default function RunesTerminal({
  height = 400,
  maxLines = 50,
  autoScroll = true,
  showFilters = true,
  className = ''
}: RunesTerminalProps) {
  const [runesData, setRunesData] = useState<RuneData[]>([]);
  const [terminalHistory, setTerminalHistory] = useState<TerminalCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isRunning, setIsRunning] = useState(true);
  const [filter, setFilter] = useState<'all' | 'minting' | 'trending' | 'completed'>('all');
  const [fullscreen, setFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Comandos disponíveis
  const availableCommands = {
    'ls': 'Listar todas as runes',
    'ls -trending': 'Listar runes em alta',
    'ls -minting': 'Listar runes em processo de mint',
    'show <symbol>': 'Mostrar detalhes de uma rune específica',
    'watch <symbol>': 'Monitorar uma rune em tempo real',
    'unwatch <symbol>': 'Parar de monitorar uma rune',
    'market': 'Mostrar resumo do mercado de runes',
    'top': 'Mostrar top 10 runes por volume',
    'clear': 'Limpar terminal',
    'help': 'Mostrar comandos disponíveis',
    'exit': 'Sair do terminal'
  };

  // Gerar dados mock de runes
  const generateRunesData = (): RuneData[] => {
    const runeNames = [
      'UNCOMMON•GOODS', 'RSIC•GENESIS•RUNE', 'DOG•GO•TO•THE•MOON',
      'SATOSHI•NAKAMOTO', 'BITCOIN•PIZZA•DAY', 'ORDINAL•THEORY',
      'DIGITAL•ARTIFACTS', 'RARE•SATS•CLUB', 'CYPHER•PUNK•ETHOS',
      'DECENTRALIZED•WEB', 'PROOF•OF•WORK', 'HASH•RATE•POWER',
      'BLOCK•REWARD•HALF', 'MINING•DIFFICULTY', 'MEMPOOL•CHAOS'
    ];

    return runeNames.map((name, index) => {
      const basePrice = Math.random() * 1000 + 10;
      const change = (Math.random() - 0.5) * 0.2 * basePrice;
      const volume = Math.random() * 10000000 + 100000;
      
      return {
        id: `rune_${index + 1}`,
        symbol: name.replace(/•/g, ''),
        name,
        spacedName: name,
        price: basePrice,
        change24h: change,
        changePercent24h: (change / basePrice) * 100,
        volume24h: volume,
        marketCap: basePrice * (Math.random() * 1000000 + 100000),
        holders: Math.floor(Math.random() * 10000 + 100),
        totalSupply: Math.floor(Math.random() * 21000000 + 1000000),
        circulatingSupply: Math.floor(Math.random() * 15000000 + 500000),
        mintProgress: Math.random() * 100,
        status: ['active', 'minting', 'completed', 'premint'][Math.floor(Math.random() * 4)] as any,
        divisibility: Math.floor(Math.random() * 18),
        etching: `${Math.floor(Math.random() * 900000 + 100000)}:${Math.floor(Math.random() * 1000)}:0`,
        lastUpdate: Date.now()
      };
    });
  };

  // Carregar dados iniciais
  useEffect(() => {
    const data = generateRunesData();
    setRunesData(data);
    
    // Adicionar comando inicial
    addToTerminal('system', 'RUNES TERMINAL v1.0.0 - INITIALIZED', 'success');
    addToTerminal('system', 'Type "help" for available commands', 'info');
    addToTerminal('system', `Loaded ${data.length} runes`, 'info');
  }, []);

  // Auto-scroll do terminal
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory, autoScroll]);

  // Simulação de atualizações em tempo real
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setRunesData(prevData => 
        prevData.map(rune => {
          const shouldUpdate = Math.random() < 0.3; // 30% chance de atualizar
          if (!shouldUpdate) return rune;

          const priceChange = (Math.random() - 0.5) * 0.02 * rune.price;
          const newPrice = Math.max(rune.price + priceChange, 0.01);
          const volumeChange = (Math.random() - 0.5) * 0.1 * rune.volume24h;
          
          // Log da mudança se significativa
          if (Math.abs(priceChange / rune.price) > 0.01) {
            const direction = priceChange > 0 ? '📈' : '📉';
            addToTerminal(
              'market', 
              `${direction} ${rune.symbol}: $${newPrice.toFixed(6)} (${priceChange > 0 ? '+' : ''}${((priceChange / rune.price) * 100).toFixed(2)}%)`,
              priceChange > 0 ? 'success' : 'warning'
            );
          }

          return {
            ...rune,
            price: newPrice,
            change24h: rune.change24h + priceChange,
            changePercent24h: ((rune.change24h + priceChange) / (newPrice - priceChange)) * 100,
            volume24h: Math.max(rune.volume24h + volumeChange, 0),
            lastUpdate: Date.now()
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Adicionar linha ao terminal
  const addToTerminal = (command: string, output: string, type: TerminalCommand['type'] = 'info') => {
    const newEntry: TerminalCommand = {
      timestamp: Date.now(),
      command,
      output,
      type
    };

    setTerminalHistory(prev => {
      const updated = [...prev, newEntry];
      return updated.length > maxLines ? updated.slice(-maxLines) : updated;
    });
  };

  // Processar comando
  const processCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const parts = trimmedCmd.split(' ');
    const baseCmd = parts[0];
    const args = parts.slice(1);

    addToTerminal(`> ${cmd}`, '', 'info');

    switch (baseCmd) {
      case 'help':
        Object.entries(availableCommands).forEach(([cmd, desc]) => {
          addToTerminal('help', `${cmd.padEnd(20)} - ${desc}`, 'info');
        });
        break;

      case 'ls':
        const filterType = args[0]?.replace('-', '') || 'all';
        let filteredRunes = runesData;
        
        if (filterType === 'trending') {
          filteredRunes = runesData.filter(r => r.changePercent24h > 5);
        } else if (filterType === 'minting') {
          filteredRunes = runesData.filter(r => r.status === 'minting');
        }

        addToTerminal('ls', `Found ${filteredRunes.length} runes:`, 'success');
        filteredRunes.slice(0, 10).forEach(rune => {
          const trend = rune.changePercent24h >= 0 ? '📈' : '📉';
          const status = rune.status === 'minting' ? '⚡' : rune.status === 'completed' ? '✅' : '🔄';
          addToTerminal(
            'ls', 
            `${status} ${rune.symbol.padEnd(15)} $${rune.price.toFixed(6).padEnd(12)} ${trend} ${rune.changePercent24h.toFixed(2)}%`,
            'info'
          );
        });
        break;

      case 'show':
        if (!args[0]) {
          addToTerminal('show', 'Usage: show <symbol>', 'error');
          break;
        }
        const rune = runesData.find(r => r.symbol.toLowerCase() === args[0]);
        if (!rune) {
          addToTerminal('show', `Rune "${args[0]}" not found`, 'error');
          break;
        }
        
        addToTerminal('show', `=== ${rune.name} ===`, 'success');
        addToTerminal('show', `Symbol: ${rune.symbol}`, 'info');
        addToTerminal('show', `Price: $${rune.price.toFixed(6)}`, 'info');
        addToTerminal('show', `24h Change: ${rune.changePercent24h.toFixed(2)}%`, 'info');
        addToTerminal('show', `Volume: $${rune.volume24h.toLocaleString()}`, 'info');
        addToTerminal('show', `Market Cap: $${rune.marketCap.toLocaleString()}`, 'info');
        addToTerminal('show', `Holders: ${rune.holders.toLocaleString()}`, 'info');
        addToTerminal('show', `Status: ${rune.status}`, 'info');
        addToTerminal('show', `Mint Progress: ${rune.mintProgress.toFixed(1)}%`, 'info');
        break;

      case 'market':
        const totalMarketCap = runesData.reduce((sum, r) => sum + r.marketCap, 0);
        const totalVolume = runesData.reduce((sum, r) => sum + r.volume24h, 0);
        const avgChange = runesData.reduce((sum, r) => sum + r.changePercent24h, 0) / runesData.length;
        
        addToTerminal('market', '=== RUNES MARKET OVERVIEW ===', 'success');
        addToTerminal('market', `Total Market Cap: $${totalMarketCap.toLocaleString()}`, 'info');
        addToTerminal('market', `24h Volume: $${totalVolume.toLocaleString()}`, 'info');
        addToTerminal('market', `Average Change: ${avgChange.toFixed(2)}%`, 'info');
        addToTerminal('market', `Active Runes: ${runesData.filter(r => r.status === 'active').length}`, 'info');
        addToTerminal('market', `Minting: ${runesData.filter(r => r.status === 'minting').length}`, 'info');
        break;

      case 'top':
        const topRunes = [...runesData]
          .sort((a, b) => b.volume24h - a.volume24h)
          .slice(0, 10);
        
        addToTerminal('top', '=== TOP 10 BY VOLUME ===', 'success');
        topRunes.forEach((rune, i) => {
          const trend = rune.changePercent24h >= 0 ? '📈' : '📉';
          addToTerminal(
            'top',
            `${(i + 1).toString().padStart(2)}. ${rune.symbol.padEnd(15)} $${rune.volume24h.toLocaleString().padEnd(12)} ${trend}`,
            'info'
          );
        });
        break;

      case 'clear':
        setTerminalHistory([]);
        break;

      case '':
        break;

      default:
        addToTerminal('error', `Command not found: ${baseCmd}`, 'error');
        addToTerminal('error', 'Type "help" for available commands', 'info');
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (currentCommand.trim()) {
        processCommand(currentCommand);
        setCurrentCommand('');
      }
    }
  };

  // Filtrar dados baseado no filtro
  const getFilteredData = () => {
    switch (filter) {
      case 'minting':
        return runesData.filter(r => r.status === 'minting');
      case 'trending':
        return runesData.filter(r => r.changePercent24h > 5);
      case 'completed':
        return runesData.filter(r => r.status === 'completed');
      default:
        return runesData;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getTypeColor = (type: TerminalCommand['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className={`${styles.tradingCard} ${className} ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5" />
              <span>RUNES TERMINAL</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`${styles.connectionDot} ${isRunning ? styles.connectionDotConnected : styles.connectionDotDisconnected}`}></div>
              <span className={`text-xs ${isRunning ? 'text-green-400' : 'text-red-400'}`}>
                {isRunning ? 'LIVE' : 'PAUSED'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Controls */}
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-2 rounded transition-colors ${
                isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>

            {/* Filter */}
            {showFilters && (
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-gray-800 text-green-400 border border-gray-600 rounded px-2 py-1 text-sm"
              >
                <option value="all">All</option>
                <option value="minting">Minting</option>
                <option value="trending">Trending</option>
                <option value="completed">Completed</option>
              </select>
            )}

            {/* Fullscreen */}
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Window */}
      <div className={styles.terminalWindow} style={{ height: fullscreen ? 'calc(100vh - 150px)' : height }}>
        {/* Terminal Output */}
        <div 
          ref={terminalRef}
          className="flex-1 overflow-y-auto space-y-1 mb-4"
        >
          {terminalHistory.map((entry, index) => (
            <div key={index} className="flex text-xs">
              <span className="text-gray-500 w-20 flex-shrink-0">
                [{formatTimestamp(entry.timestamp)}]
              </span>
              <span className={`${getTypeColor(entry.type)} flex-1`}>
                {entry.command && (
                  <span className="text-green-400 mr-2">{entry.command}</span>
                )}
                {entry.output}
              </span>
            </div>
          ))}
        </div>

        {/* Command Input */}
        <div className="flex items-center border-t border-gray-700 pt-2">
          <span className={styles.terminalPrompt}>runes@terminal:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent text-green-400 outline-none font-mono"
            placeholder="Enter command (type 'help' for commands)"
            autoFocus
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 border-t border-gray-700 text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">
            Runes: {getFilteredData().length}
          </span>
          <span className="text-gray-400">
            History: {terminalHistory.length}/{maxLines}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">
            Filter: {filter.toUpperCase()}
          </span>
          <span className="text-gray-400">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}