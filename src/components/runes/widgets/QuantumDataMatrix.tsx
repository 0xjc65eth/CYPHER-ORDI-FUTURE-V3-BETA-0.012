'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, 
  Activity, 
  Zap, 
  Brain,
  Radio,
  Wifi,
  Target,
  Eye,
  Scan,
  Database,
  Network,
  Layers,
  GitBranch,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Triangle,
  Circle,
  Square,
  Hexagon
} from 'lucide-react';
import { RuneMarketData } from '@/services/runes';

interface QuantumDataMatrixProps {
  data: RuneMarketData[];
  selectedRune?: RuneMarketData | null;
}

interface DataStream {
  id: string;
  value: string;
  type: 'price' | 'volume' | 'change' | 'hash' | 'neural';
  x: number;
  y: number;
  speed: number;
  intensity: number;
  color: string;
}

interface QuantumParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  type: 'data' | 'energy' | 'signal';
}

export default function QuantumDataMatrix({ data, selectedRune }: QuantumDataMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matrixRef = useRef<HTMLDivElement>(null);
  const [dataStreams, setDataStreams] = useState<DataStream[]>([]);
  const [particles, setParticles] = useState<QuantumParticle[]>([]);
  const [scanMode, setScanMode] = useState<'neural' | 'quantum' | 'blockchain' | 'temporal'>('neural');
  const [intensity, setIntensity] = useState(0);

  // Generate matrix data streams
  useEffect(() => {
    const generateStream = () => {
      if (data.length === 0) return;

      const streams: DataStream[] = [];
      const chars = '0123456789ABCDEF';
      
      for (let i = 0; i < 40; i++) {
        const rune = data[Math.floor(Math.random() * data.length)];
        let value = '';
        let type: DataStream['type'] = 'hash';
        let color = '#10b981';

        switch (Math.floor(Math.random() * 5)) {
          case 0:
            value = `$${rune.price.current.toFixed(6)}`;
            type = 'price';
            color = rune.price.change24h >= 0 ? '#10b981' : '#ef4444';
            break;
          case 1:
            value = `${(rune.volume.volume24h / 1000000).toFixed(2)}M`;
            type = 'volume';
            color = '#3b82f6';
            break;
          case 2:
            value = `${rune.price.change24h.toFixed(2)}%`;
            type = 'change';
            color = rune.price.change24h >= 0 ? '#10b981' : '#ef4444';
            break;
          case 3:
            value = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            type = 'hash';
            color = '#fb7185';
            break;
          case 4:
            value = `N${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
            type = 'neural';
            color = '#a855f7';
            break;
        }

        streams.push({
          id: `stream-${i}`,
          value,
          type,
          x: Math.random() * 100,
          y: Math.random() * 100,
          speed: 0.5 + Math.random() * 2,
          intensity: Math.random(),
          color
        });
      }

      setDataStreams(streams);
    };

    generateStream();
    const interval = setInterval(generateStream, 2000);
    return () => clearInterval(interval);
  }, [data]);

  // Quantum particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;

    let animationFrame: number;
    let particleArray: QuantumParticle[] = [];

    const createParticle = (x: number, y: number, type: QuantumParticle['type']) => {
      return {
        id: `particle-${Date.now()}-${Math.random()}`,
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 1 + Math.random() * 3,
        life: 0,
        maxLife: 60 + Math.random() * 120,
        type
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background quantum field
      const gradient = ctx.createRadialGradient(400, 200, 0, 400, 200, 400);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.02)');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.01)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add new particles
      if (Math.random() < 0.3) {
        particleArray.push(createParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          ['data', 'energy', 'signal'][Math.floor(Math.random() * 3)] as QuantumParticle['type']
        ));
      }

      // Update and draw particles
      particleArray = particleArray.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        const alpha = 1 - (particle.life / particle.maxLife);
        
        if (alpha <= 0) return false;

        // Particle interaction with selected rune
        if (selectedRune) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const dx = centerX - particle.x;
          const dy = centerY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            particle.vx += dx * 0.001;
            particle.vy += dy * 0.001;
          }
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = alpha;
        
        const colors = {
          data: `rgba(59, 130, 246, ${alpha})`,
          energy: `rgba(251, 146, 60, ${alpha})`,
          signal: `rgba(168, 85, 247, ${alpha})`
        };

        ctx.fillStyle = colors[particle.type];
        ctx.beginPath();
        
        if (particle.type === 'data') {
          ctx.rect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
        } else if (particle.type === 'energy') {
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        } else {
          // Triangle for signal
          ctx.moveTo(particle.x, particle.y - particle.size);
          ctx.lineTo(particle.x - particle.size, particle.y + particle.size);
          ctx.lineTo(particle.x + particle.size, particle.y + particle.size);
          ctx.closePath();
        }
        
        ctx.fill();
        ctx.restore();

        return true;
      });

      // Connect nearby particles
      for (let i = 0; i < particleArray.length; i++) {
        for (let j = i + 1; j < particleArray.length; j++) {
          const p1 = particleArray[i];
          const p2 = particleArray[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            ctx.strokeStyle = `rgba(251, 146, 60, ${0.3 * (1 - distance / 80)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [selectedRune]);

  // Update intensity based on market activity
  useEffect(() => {
    if (data.length === 0) return;
    
    const avgVolatility = data.reduce((sum, rune) => sum + Math.abs(rune.price.change24h), 0) / data.length;
    setIntensity(Math.min(1, avgVolatility / 20));
  }, [data]);

  return (
    <Card className="bg-black border-gray-800 overflow-hidden">
      <CardContent className="p-0">
        {/* Quantum Matrix Header */}
        <div className="relative p-4 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20"
              >
                <Database className="h-5 w-5 text-purple-400" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-white">Quantum Data Matrix</h3>
                <p className="text-xs text-gray-400">Neural Network Data Streams</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1"
              >
                <Radio className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400 font-mono">NEURAL-LINK</span>
              </motion.div>
              
              <Badge variant="outline" className={`
                text-xs border-0 ${
                  intensity > 0.7 ? 'bg-red-500/20 text-red-400' :
                  intensity > 0.4 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }
              `}>
                {(intensity * 100).toFixed(0)}% FLUX
              </Badge>
            </div>
          </div>

          {/* Scan Mode Selector */}
          <div className="flex gap-2 mt-3">
            {['neural', 'quantum', 'blockchain', 'temporal'].map((mode) => (
              <motion.button
                key={mode}
                className={`
                  px-3 py-1 rounded-md text-xs font-mono uppercase transition-all
                  ${scanMode === mode 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }
                `}
                onClick={() => setScanMode(mode as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mode}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quantum Particle Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-64 bg-black"
            style={{ maxWidth: '100%', height: '200px' }}
          />
          
          {selectedRune && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-orange-400 font-mono">
                  {selectedRune.symbol}
                </div>
                <div className="text-sm text-gray-400">
                  Neural Focus Target
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Data Stream Matrix */}
        <div 
          ref={matrixRef}
          className="relative h-48 overflow-hidden bg-gradient-to-b from-black to-gray-900"
        >
          <div className="absolute inset-0 p-2">
            <div className="grid grid-cols-8 gap-1 h-full text-xs font-mono">
              <AnimatePresence>
                {dataStreams.map((stream, index) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ 
                      opacity: [0, stream.intensity, 0],
                      y: ['0%', '100%'],
                      color: stream.color
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "linear"
                    }}
                    className="text-center"
                    style={{ 
                      color: stream.color,
                      textShadow: `0 0 10px ${stream.color}50`
                    }}
                  >
                    {stream.value}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Scan Lines */}
          <motion.div
            className="absolute inset-0 border-t-2 border-orange-400/50"
            animate={{ y: ['0%', '100%'] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <motion.div
            className="absolute inset-0 border-t border-blue-400/30"
            animate={{ y: ['0%', '100%'] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
              delay: 0.5
            }}
          />
        </div>

        {/* Neural Activity Indicators */}
        <div className="p-4 bg-gradient-to-r from-gray-900 to-black border-t border-gray-800">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Brain className="h-3 w-3 text-purple-400" />
                <span className="text-xs text-gray-400">NEURAL</span>
              </div>
              <div className="text-sm font-mono text-purple-400">
                {(intensity * 847).toFixed(0)}Hz
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-gray-400">ENERGY</span>
              </div>
              <div className="text-sm font-mono text-yellow-400">
                {(intensity * 1247).toFixed(0)}kV
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Network className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-gray-400">NODES</span>
              </div>
              <div className="text-sm font-mono text-blue-400">
                {data.length * 47}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-3 w-3 text-green-400" />
                <span className="text-xs text-gray-400">SYNC</span>
              </div>
              <div className="text-sm font-mono text-green-400">
                {(99.7 + Math.random() * 0.3).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}