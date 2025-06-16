'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Zap, AlertTriangle } from 'lucide-react';
import styles from '../../styles/WallStreet.module.css';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  type: 'crypto' | 'rune' | 'ordinal' | 'stock';
  trending?: boolean;
  alert?: 'high' | 'medium' | 'low';
  lastUpdate: number;
}

interface TickerTapeProps {
  items: TickerItem[];
  speed?: number;
  pauseOnHover?: boolean;
  showVolume?: boolean;
  className?: string;
}

export default function TickerTape({
  items = [],
  speed = 30,
  pauseOnHover = true,
  showVolume = true,
  className = ''
}: TickerTapeProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(speed);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Atualizar duração da animação baseada na velocidade
  useEffect(() => {
    setAnimationDuration(speed);
  }, [speed]);

  // Formatação de preços
  const formatPrice = (price: number): string => {
    if (price < 0.000001) return `${(price * 100000000).toFixed(0)} sats`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 1000) return `$${price.toFixed(2)}`;
    if (price < 1000000) return `$${(price / 1000).toFixed(1)}K`;
    return `$${(price / 1000000).toFixed(1)}M`;
  };

  const formatChange = (change: number, isPercent: boolean = false): string => {
    const sign = change >= 0 ? '+' : '';
    const suffix = isPercent ? '%' : '';
    return `${sign}${change.toFixed(2)}${suffix}`;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000) return `${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  // Obter ícone do tipo de asset
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'crypto': return '₿';
      case 'rune': return '⚡';
      case 'ordinal': return '🔸';
      case 'stock': return '📈';
      default: return '●';
    }
  };

  // Obter cor do alerta
  const getAlertColor = (alert?: string) => {
    switch (alert) {
      case 'high': return '#ff0000';
      case 'medium': return '#ffff00';
      case 'low': return '#00ff00';
      default: return 'transparent';
    }
  };

  // Duplicar items para scroll contínuo
  const duplicatedItems = [...items, ...items];

  const handleMouseEnter = () => {
    if (pauseOnHover) setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) setIsPaused(false);
  };

  return (
    <div 
      className={`${styles.tickerTape} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Linha de scan animada */}
      <div className={styles.scanLine}></div>
      
      {/* Conteúdo do ticker */}
      <div 
        ref={tickerRef}
        className={styles.tickerContent}
        style={{
          animationDuration: `${animationDuration}s`,
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div key={`${item.symbol}-${index}`} className={styles.tickerItem}>
            {/* Ícone do tipo de asset */}
            <span 
              className="mr-2 text-yellow-400"
              style={{ 
                textShadow: '0 0 5px rgba(255, 255, 0, 0.8)',
                filter: item.alert ? `drop-shadow(0 0 3px ${getAlertColor(item.alert)})` : 'none'
              }}
            >
              {getAssetIcon(item.type)}
            </span>

            {/* Símbolo */}
            <span className={styles.tickerSymbol}>
              {item.symbol}
            </span>

            {/* Preço */}
            <span className={styles.tickerPrice}>
              {formatPrice(item.price)}
            </span>

            {/* Mudança percentual */}
            <span 
              className={`${styles.tickerChange} ${
                item.changePercent24h >= 0 
                  ? styles.tickerChangePositive 
                  : styles.tickerChangeNegative
              }`}
            >
              {item.changePercent24h >= 0 ? (
                <TrendingUp className="inline w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="inline w-3 h-3 mr-1" />
              )}
              {formatChange(item.changePercent24h, true)}
            </span>

            {/* Volume (opcional) */}
            {showVolume && (
              <span className="ml-2 text-gray-400 text-xs">
                Vol: {formatVolume(item.volume24h)}
              </span>
            )}

            {/* Indicadores especiais */}
            <div className="ml-2 flex items-center space-x-1">
              {/* Trending */}
              {item.trending && (
                <Zap className="w-3 h-3 text-orange-400 animate-pulse" />
              )}
              
              {/* Alert */}
              {item.alert && (
                <AlertTriangle 
                  className="w-3 h-3 animate-pulse" 
                  style={{ color: getAlertColor(item.alert) }}
                />
              )}
            </div>

            {/* Separador */}
            <span className="ml-4 text-gray-600">|</span>
          </div>
        ))}
      </div>

      {/* Gradientes nas bordas para efeito de fade */}
      <div 
        className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-black to-transparent pointer-events-none z-10"
      />
      <div 
        className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-black to-transparent pointer-events-none z-10"
      />

      {/* Status de conexão */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
        <div className={styles.connectionStatus}>
          <div className={`${styles.connectionDot} ${styles.connectionDotConnected}`}></div>
          <span className="text-xs text-green-400">LIVE</span>
        </div>
      </div>
    </div>
  );
}

// Hook para dados do ticker (simulado)
export function useTickerData() {
  const [tickerData, setTickerData] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const loadTickerData = () => {
      const mockData: TickerItem[] = [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 97234.56,
          change24h: 2341.23,
          changePercent24h: 2.47,
          volume24h: 28500000000,
          type: 'crypto',
          trending: true,
          alert: 'high',
          lastUpdate: Date.now()
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: 3456.78,
          change24h: -123.45,
          changePercent24h: -3.45,
          volume24h: 15200000000,
          type: 'crypto',
          lastUpdate: Date.now()
        },
        {
          symbol: 'ORDI',
          name: 'Ordinals',
          price: 34.56,
          change24h: 5.67,
          changePercent24h: 19.6,
          volume24h: 45000000,
          type: 'ordinal',
          trending: true,
          alert: 'medium',
          lastUpdate: Date.now()
        },
        {
          symbol: 'RSIC',
          name: 'Rune Stone',
          price: 0.0123,
          change24h: 0.0034,
          changePercent24h: 38.2,
          volume24h: 2300000,
          type: 'rune',
          trending: true,
          alert: 'high',
          lastUpdate: Date.now()
        },
        {
          symbol: 'PEPE',
          name: 'Pepe Rune',
          price: 0.000045,
          change24h: -0.000012,
          changePercent24h: -21.1,
          volume24h: 890000,
          type: 'rune',
          lastUpdate: Date.now()
        },
        {
          symbol: 'MSTR',
          name: 'MicroStrategy',
          price: 423.45,
          change24h: 18.90,
          changePercent24h: 4.67,
          volume24h: 1200000,
          type: 'stock',
          alert: 'medium',
          lastUpdate: Date.now()
        }
      ];

      setTickerData(mockData);
      setIsLoading(false);
    };

    loadTickerData();

    // Simular atualizações em tempo real
    const interval = setInterval(() => {
      setTickerData(prevData => 
        prevData.map(item => ({
          ...item,
          price: item.price * (1 + (Math.random() - 0.5) * 0.002), // Variação de ±0.1%
          change24h: item.change24h * (1 + (Math.random() - 0.5) * 0.05),
          changePercent24h: item.changePercent24h * (1 + (Math.random() - 0.5) * 0.05),
          volume24h: item.volume24h * (1 + (Math.random() - 0.5) * 0.01),
          lastUpdate: Date.now()
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { tickerData, isLoading };
}