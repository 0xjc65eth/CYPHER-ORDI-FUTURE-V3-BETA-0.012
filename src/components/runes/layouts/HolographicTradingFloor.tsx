'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Brain,
  Eye,
  Cpu,
  Radio,
  Wifi,
  Target,
  Layers,
  Sparkles,
  Atom,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart4,
  LineChart,
  PieChart,
  Radar,
  Waves,
  Orbit,
  Crosshair,
  Focus
} from 'lucide-react';
import { RuneMarketData } from '@/services/runes';

interface HolographicTradingFloorProps {
  data: RuneMarketData[];
  selectedRune?: RuneMarketData | null;
  onSelectRune?: (rune: RuneMarketData) => void;
}

interface NeuralNode {
  id: string;
  x: number;
  y: number;
  strength: number;
  connections: string[];
  data: RuneMarketData;
  pulse: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

interface AIInsight {
  id: string;
  type: 'prediction' | 'pattern' | 'anomaly' | 'opportunity';
  message: string;
  confidence: number;
  timestamp: number;
  data?: any;
}

export default function HolographicTradingFloor({ 
  data, 
  selectedRune, 
  onSelectRune 
}: HolographicTradingFloorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [neuralNodes, setNeuralNodes] = useState<NeuralNode[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [brainWaveFreq, setBrainWaveFreq] = useState(0);
  const [quantumState, setQuantumState] = useState(0);
  const [dataFlow, setDataFlow] = useState<{[key: string]: number}>({});
  const [hologramOpacity, setHologramOpacity] = useState(0.8);
  const [scanMode, setScanMode] = useState<'neural' | 'quantum' | 'temporal' | 'dimensional'>('neural');

  // Quantum-like animations
  const springConfig = { stiffness: 100, damping: 10 };
  const quantumSpring = useSpring(quantumState, springConfig);
  const brainSpring = useSpring(brainWaveFreq, springConfig);

  // Time update with brain wave simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setBrainWaveFreq(prev => (prev + 0.1) % (Math.PI * 2));
      setQuantumState(prev => (prev + 0.05) % (Math.PI * 4));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Generate Neural Network from Runes Data
  useEffect(() => {
    if (data.length === 0) return;

    const nodes: NeuralNode[] = data.slice(0, 20).map((rune, index) => {
      const angle = (index / 20) * Math.PI * 2;
      const radius = 150 + (rune.marketCap.rank <= 5 ? 50 : 0);
      const centerX = 400;
      const centerY = 300;
      
      return {
        id: rune.id,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        strength: Math.abs(rune.price.change24h) * 5,
        connections: data
          .filter(r => r.id !== rune.id && Math.abs(r.price.change24h - rune.price.change24h) < 10)
          .slice(0, 3)
          .map(r => r.id),
        data: rune,
        pulse: Math.random(),
        sentiment: rune.price.change24h > 5 ? 'bullish' : 
                  rune.price.change24h < -5 ? 'bearish' : 'neutral'
      };
    });

    setNeuralNodes(nodes);
  }, [data]);

  // AI Insights Generator
  useEffect(() => {
    const generateInsights = () => {
      if (data.length === 0) return;

      const insights: AIInsight[] = [];
      
      // Pattern Recognition
      const strongGainers = data.filter(r => r.price.change24h > 10);
      if (strongGainers.length >= 3) {
        insights.push({
          id: `pattern-${Date.now()}`,
          type: 'pattern',
          message: `🧠 Neural pattern detected: ${strongGainers.length} runes showing coordinated upward movement`,
          confidence: 0.87,
          timestamp: Date.now(),
          data: strongGainers
        });
      }

      // Anomaly Detection
      const extremeVolume = data.find(r => r.volume.volume24h > 5000000);
      if (extremeVolume) {
        insights.push({
          id: `anomaly-${Date.now()}`,
          type: 'anomaly',
          message: `⚡ Quantum anomaly: ${extremeVolume.name} volume spike detected (${(extremeVolume.volume.volume24h / 1000000).toFixed(1)}M)`,
          confidence: 0.94,
          timestamp: Date.now(),
          data: extremeVolume
        });
      }

      // Prediction
      const trendingRune = data.find(r => r.price.change24h > 15);
      if (trendingRune) {
        insights.push({
          id: `prediction-${Date.now()}`,
          type: 'prediction',
          message: `🔮 Temporal prediction: ${trendingRune.name} momentum indicates 78% probability of continued growth`,
          confidence: 0.78,
          timestamp: Date.now(),
          data: trendingRune
        });
      }

      // Opportunity
      const undervalued = data.find(r => r.marketCap.rank > 15 && r.price.change24h > 8);
      if (undervalued) {
        insights.push({
          id: `opportunity-${Date.now()}`,
          type: 'opportunity',
          message: `💎 Hidden gem identified: ${undervalued.name} showing strong signals despite low rank`,
          confidence: 0.73,
          timestamp: Date.now(),
          data: undervalued
        });
      }

      setAiInsights(prev => [...insights, ...prev.slice(0, 10)]);
    };

    const interval = setInterval(generateInsights, 15000);
    generateInsights(); // Initial run
    return () => clearInterval(interval);
  }, [data]);

  // Neural Network Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw quantum field background
      const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 300);
      gradient.addColorStop(0, 'rgba(251, 146, 60, 0.05)');
      gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.03)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw neural connections
      neuralNodes.forEach(node => {
        node.connections.forEach(connId => {
          const connNode = neuralNodes.find(n => n.id === connId);
          if (connNode) {
            const pulse = Math.sin(Date.now() * 0.005 + node.pulse) * 0.5 + 0.5;
            ctx.strokeStyle = `rgba(251, 146, 60, ${pulse * 0.3})`;
            ctx.lineWidth = 1 + pulse;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(connNode.x, connNode.y);
            ctx.stroke();
          }
        });
      });

      // Draw neural nodes
      neuralNodes.forEach(node => {
        const pulse = Math.sin(Date.now() * 0.008 + node.pulse * Math.PI) * 0.3 + 0.7;
        const size = 8 + node.strength;
        
        // Node glow
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 2);
        const color = node.sentiment === 'bullish' ? '34, 197, 94' : 
                     node.sentiment === 'bearish' ? '239, 68, 68' : '156, 163, 175';
        glowGradient.addColorStop(0, `rgba(${color}, ${pulse * 0.8})`);
        glowGradient.addColorStop(1, `rgba(${color}, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Node core
        ctx.fillStyle = `rgba(${color}, ${pulse})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [neuralNodes]);

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const marketStats = {
    totalCap: data.reduce((sum, rune) => sum + rune.marketCap.current, 0),
    totalVolume: data.reduce((sum, rune) => sum + rune.volume.volume24h, 0),
    avgChange: data.length > 0 ? data.reduce((sum, rune) => sum + rune.price.change24h, 0) / data.length : 0,
    bullishSignals: data.filter(rune => rune.price.change24h > 5).length,
    bearishSignals: data.filter(rune => rune.price.change24h < -5).length,
    neuralStrength: neuralNodes.reduce((sum, node) => sum + node.strength, 0) / Math.max(neuralNodes.length, 1)
  };

  const HolographicCard = ({ children, className = "", ...props }: any) => (
    <motion.div
      className={`
        relative bg-gradient-to-br from-black/90 via-gray-900/80 to-black/90 
        border border-orange-400/30 rounded-xl backdrop-blur-xl
        shadow-2xl shadow-orange-500/10
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-orange-400/5 before:to-transparent before:rounded-xl
        after:absolute after:inset-0 after:bg-gradient-to-t after:from-blue-500/3 after:to-transparent after:rounded-xl
        ${className}
      `}
      whileHover={{ scale: 1.02, boxShadow: '0 25px 50px rgba(251, 146, 60, 0.25)' }}
      {...props}
    >
      {children}
    </motion.div>
  );

  const QuantumMetric = ({ icon: Icon, label, value, change, sentiment }: any) => (
    <HolographicCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="p-2 rounded-lg bg-gradient-to-br from-orange-400/20 to-orange-600/20"
          >
            <Icon className="h-4 w-4 text-orange-400" />
          </motion.div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
        <Badge variant="outline" className={`
          text-xs border-0 ${
            sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
            sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
            'bg-blue-500/20 text-blue-400'
          }
        `}>
          LIVE
        </Badge>
      </div>
      
      <div className="space-y-2">
        <motion.div
          className="text-2xl font-bold text-white font-mono"
          animate={{ textShadow: `0 0 20px rgba(251, 146, 60, ${Math.sin(brainWaveFreq) * 0.3 + 0.7})` }}
        >
          {value}
        </motion.div>
        
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span className="font-mono">
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </HolographicCard>
  );

  const NeuralInsightPanel = () => (
    <HolographicCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <Brain className="h-5 w-5 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-white">Neural AI Insights</h3>
            <p className="text-xs text-gray-400">Quantum-Enhanced Pattern Recognition</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Cpu className="h-4 w-4 text-blue-400" />
          </motion.div>
          <span className="text-xs text-blue-400 font-mono">
            {(marketStats.neuralStrength * 10).toFixed(1)}Hz
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {aiInsights.slice(0, 5).map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={`
                p-3 rounded-lg border ${
                  insight.type === 'prediction' ? 'border-purple-500/30 bg-purple-500/5' :
                  insight.type === 'pattern' ? 'border-blue-500/30 bg-blue-500/5' :
                  insight.type === 'anomaly' ? 'border-red-500/30 bg-red-500/5' :
                  'border-green-500/30 bg-green-500/5'
                }
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-white leading-relaxed">{insight.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(insight.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-400 to-green-400 rounded-full"
                          style={{ width: `${insight.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 font-mono">
                        {(insight.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </HolographicCard>
  );

  return (
    <div className="space-y-6 relative">
      {/* Holographic Particles Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5" />
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Quantum Command Center */}
      <HolographicCard className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Atom className="h-6 w-6 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-orange-400/50 animate-ping" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                QUANTUM <span className="text-orange-400">RUNES</span> NEXUS
              </h1>
              <p className="text-gray-400">Dimensional Trading Protocol • Neural-Enhanced</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Quantum Time</p>
              <p className="text-lg font-mono text-white">
                {currentTime.toLocaleTimeString()}
              </p>
            </div>
            
            <motion.div
              className="flex gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge variant="outline" className="bg-green-500/20 border-green-500/50 text-green-400">
                <Radio className="h-3 w-3 mr-1" />
                NEURAL-LINK
              </Badge>
              <Badge variant="outline" className="bg-purple-500/20 border-purple-500/50 text-purple-400">
                <Orbit className="h-3 w-3 mr-1" />
                QUANTUM-SYNC
              </Badge>
            </motion.div>
          </div>
        </div>

        {/* Neural Network Visualization */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-96 rounded-xl border border-orange-400/30 bg-black/50"
            style={{ maxWidth: '800px', height: '400px' }}
          />
          
          <div className="absolute top-4 left-4 space-y-2">
            <Badge variant="outline" className="bg-black/80 border-orange-500/50 text-orange-400">
              <Radio className="h-3 w-3 mr-1" />
              Neural Activity: {(marketStats.neuralStrength * 10).toFixed(1)}Hz
            </Badge>
            <Badge variant="outline" className="bg-black/80 border-blue-500/50 text-blue-400">
              <Waves className="h-3 w-3 mr-1" />
              Quantum Coherence: {(Math.sin(quantumState) * 50 + 50).toFixed(0)}%
            </Badge>
          </div>
        </div>
      </HolographicCard>

      {/* Quantum Metrics Grid */}
      <div className="grid grid-cols-6 gap-4">
        <QuantumMetric
          icon={Target}
          label="Total Market"
          value={`$${formatNumber(marketStats.totalCap)}`}
          sentiment="neutral"
        />
        <QuantumMetric
          icon={Activity}
          label="Volume Flow"
          value={`$${formatNumber(marketStats.totalVolume)}`}
          change={12.5}
          sentiment="positive"
        />
        <QuantumMetric
          icon={TrendingUp}
          label="Bull Signals"
          value={marketStats.bullishSignals}
          sentiment="positive"
        />
        <QuantumMetric
          icon={TrendingDown}
          label="Bear Signals"
          value={marketStats.bearishSignals}
          sentiment="negative"
        />
        <QuantumMetric
          icon={Brain}
          label="Neural Avg"
          value={`${marketStats.avgChange.toFixed(1)}%`}
          change={marketStats.avgChange}
          sentiment={marketStats.avgChange >= 0 ? "positive" : "negative"}
        />
        <QuantumMetric
          icon={Sparkles}
          label="Quantum Field"
          value={`${(Math.sin(quantumState) * 50 + 50).toFixed(0)}%`}
          sentiment="neutral"
        />
      </div>

      {/* Advanced Analytics Panel */}
      <div className="grid grid-cols-3 gap-6">
        {/* Neural AI Insights */}
        <NeuralInsightPanel />

        {/* Dimensional Runes List */}
        <HolographicCard className="p-6 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20"
              >
                <Layers className="h-5 w-5 text-green-400" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-white">Dimensional Runes Matrix</h3>
                <p className="text-xs text-gray-400">Multi-dimensional Market Analysis</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
            {data.slice(0, 16).map((rune, index) => (
              <motion.div
                key={rune.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  relative p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedRune?.id === rune.id 
                    ? 'border-orange-400 bg-orange-500/20' 
                    : 'border-gray-700 hover:border-gray-600'
                  }
                  ${rune.price.change24h > 10 
                    ? 'shadow-lg shadow-green-500/25' 
                    : rune.price.change24h < -10 
                    ? 'shadow-lg shadow-red-500/25' 
                    : ''
                  }
                `}
                onClick={() => onSelectRune?.(rune)}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute -top-1 -right-1">
                  <Badge variant="outline" className="text-xs bg-black border-gray-600">
                    #{rune.marketCap.rank}
                  </Badge>
                </div>

                <div className="text-center space-y-2">
                  <p className="font-bold text-xs text-white truncate" title={rune.name}>
                    {rune.symbol}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    ${rune.price.current < 0.01 ? rune.price.current.toFixed(6) : rune.price.current.toFixed(4)}
                  </p>
                  <div className={`text-xs font-bold ${
                    rune.price.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {rune.price.change24h >= 0 ? '+' : ''}{rune.price.change24h.toFixed(1)}%
                  </div>
                </div>

                {/* Quantum effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg border border-orange-400/0 pointer-events-none"
                  animate={{
                    borderColor: selectedRune?.id === rune.id 
                      ? ['rgba(251, 146, 60, 0)', 'rgba(251, 146, 60, 0.5)', 'rgba(251, 146, 60, 0)']
                      : 'rgba(251, 146, 60, 0)'
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </div>
        </HolographicCard>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 146, 60, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 146, 60, 0.7);
        }
      `}</style>
    </div>
  );
}