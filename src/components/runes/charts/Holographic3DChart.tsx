'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Box,
  Layers,
  RotateCw,
  Maximize,
  RotateCcw,
  Eye,
  Zap,
  Brain,
  Atom,
  Orbit,
  Square,
  Triangle,
  Circle
} from 'lucide-react';
import { RuneMarketData } from '@/services/runes';

interface Holographic3DChartProps {
  selectedRune?: RuneMarketData | null;
  data: RuneMarketData[];
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface DataPoint3D extends Point3D {
  value: number;
  timestamp: number;
  color: string;
  size: number;
}

interface HologramLayer {
  id: string;
  points: DataPoint3D[];
  color: string;
  opacity: number;
  rotation: Point3D;
}

export default function Holographic3DChart({ selectedRune, data }: Holographic3DChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [rotationZ, setRotationZ] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'hologram' | 'neural' | 'quantum' | 'temporal'>('hologram');
  const [autoRotate, setAutoRotate] = useState(true);
  const [layers, setLayers] = useState<HologramLayer[]>([]);
  const [mouseDown, setMouseDown] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

  // Generate 3D holographic data
  useEffect(() => {
    if (!selectedRune || data.length === 0) return;

    const newLayers: HologramLayer[] = [];

    // Price layer (main hologram)
    const pricePoints: DataPoint3D[] = [];
    for (let i = 0; i < 50; i++) {
      const time = i / 49;
      const basePrice = selectedRune.price.current;
      const volatility = Math.abs(selectedRune.price.change24h) / 100;
      
      // Generate realistic price movement with some noise
      const noise = (Math.sin(time * Math.PI * 4) + Math.cos(time * Math.PI * 7)) * volatility;
      const trend = selectedRune.price.change24h > 0 ? time * 0.1 : -time * 0.1;
      const price = basePrice * (1 + trend + noise);
      
      pricePoints.push({
        x: (time - 0.5) * 200,
        y: (price - basePrice) * 1000,
        z: Math.sin(time * Math.PI * 2) * 20,
        value: price,
        timestamp: Date.now() + i * 60000,
        color: price > basePrice ? '#10b981' : '#ef4444',
        size: 2 + Math.abs(noise) * 3
      });
    }

    newLayers.push({
      id: 'price',
      points: pricePoints,
      color: '#fb7185',
      opacity: 0.8,
      rotation: { x: 0, y: 0, z: 0 }
    });

    // Volume layer (secondary hologram)
    const volumePoints: DataPoint3D[] = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 80 + Math.random() * 40;
      const height = (selectedRune.volume.volume24h / 1000000) * 10 + Math.random() * 20;
      
      volumePoints.push({
        x: Math.cos(angle) * radius,
        y: height - 50,
        z: Math.sin(angle) * radius,
        value: selectedRune.volume.volume24h,
        timestamp: Date.now() + i * 120000,
        color: '#3b82f6',
        size: 1 + height / 20
      });
    }

    newLayers.push({
      id: 'volume',
      points: volumePoints,
      color: '#3b82f6',
      opacity: 0.6,
      rotation: { x: 0, y: 0, z: 0 }
    });

    // Market correlation layer (tertiary hologram)
    const correlationPoints: DataPoint3D[] = [];
    data.slice(0, 10).forEach((rune, index) => {
      const angle = (index / 10) * Math.PI * 2;
      const distance = 120 + rune.marketCap.rank * 2;
      const correlation = Math.abs(rune.price.change24h - selectedRune.price.change24h);
      
      correlationPoints.push({
        x: Math.cos(angle) * distance,
        y: correlation * 5,
        z: Math.sin(angle) * distance,
        value: correlation,
        timestamp: Date.now(),
        color: correlation < 5 ? '#10b981' : correlation < 10 ? '#f59e0b' : '#ef4444',
        size: 1 + (10 - correlation) / 5
      });
    });

    newLayers.push({
      id: 'correlation',
      points: correlationPoints,
      color: '#a855f7',
      opacity: 0.4,
      rotation: { x: 0, y: 0, z: 0 }
    });

    setLayers(newLayers);
  }, [selectedRune, data]);

  // Auto rotation
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setRotationY(prev => prev + 0.01);
      setRotationX(prev => prev + 0.005);
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate]);

  // 3D Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 500;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const project3D = (point: Point3D): { x: number; y: number; z: number } => {
      // Apply rotations
      let { x, y, z } = point;

      // Rotate around X axis
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;

      // Rotate around Y axis
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;

      // Rotate around Z axis
      const cosZ = Math.cos(rotationZ);
      const sinZ = Math.sin(rotationZ);
      const x3 = x2 * cosZ - y1 * sinZ;
      const y3 = x2 * sinZ + y1 * cosZ;

      // Apply zoom and projection
      const scale = zoomLevel * 200 / (200 + z2);
      
      return {
        x: centerX + x3 * scale,
        y: centerY - y3 * scale,
        z: z2
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Holographic background
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 400);
      bgGradient.addColorStop(0, 'rgba(168, 85, 247, 0.03)');
      bgGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.02)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.1)';
      ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i++) {
        const start = project3D({ x: i * 40, y: -100, z: -200 });
        const end = project3D({ x: i * 40, y: 100, z: 200 });
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        const start2 = project3D({ x: -200, y: -100, z: i * 40 });
        const end2 = project3D({ x: 200, y: 100, z: i * 40 });
        ctx.beginPath();
        ctx.moveTo(start2.x, start2.y);
        ctx.lineTo(end2.x, end2.y);
        ctx.stroke();
      }

      // Sort layers by view mode and render
      const sortedLayers = [...layers].sort((a, b) => {
        const priorities = { 
          hologram: { price: 0, volume: 1, correlation: 2 },
          neural: { correlation: 0, price: 1, volume: 2 },
          quantum: { volume: 0, correlation: 1, price: 2 },
          temporal: { price: 0, correlation: 1, volume: 2 }
        };
        return priorities[viewMode][a.id as keyof typeof priorities.hologram] - 
               priorities[viewMode][b.id as keyof typeof priorities.hologram];
      });

      sortedLayers.forEach(layer => {
        // Sort points by Z-depth for proper rendering
        const sortedPoints = [...layer.points].sort((a, b) => {
          const projA = project3D(a);
          const projB = project3D(b);
          return projB.z - projA.z;
        });

        // Draw connections between points
        if (layer.id === 'price') {
          ctx.strokeStyle = `rgba(251, 146, 60, ${layer.opacity * 0.3})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          sortedPoints.forEach((point, index) => {
            const projected = project3D(point);
            if (index === 0) {
              ctx.moveTo(projected.x, projected.y);
            } else {
              ctx.lineTo(projected.x, projected.y);
            }
          });
          ctx.stroke();
        }

        // Draw holographic points
        sortedPoints.forEach((point, index) => {
          const projected = project3D(point);
          const distance = Math.sqrt(projected.z * projected.z) / 200;
          const alpha = Math.max(0.1, layer.opacity * (1 - distance * 0.5));
          
          // Holographic glow effect
          const glowSize = point.size * 4;
          const glowGradient = ctx.createRadialGradient(
            projected.x, projected.y, 0,
            projected.x, projected.y, glowSize
          );
          glowGradient.addColorStop(0, `${point.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
          glowGradient.addColorStop(1, `${point.color}00`);
          
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, glowSize, 0, Math.PI * 2);
          ctx.fill();

          // Core point
          ctx.fillStyle = `${point.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          
          if (layer.id === 'price') {
            ctx.arc(projected.x, projected.y, point.size, 0, Math.PI * 2);
          } else if (layer.id === 'volume') {
            const size = point.size;
            ctx.rect(projected.x - size/2, projected.y - size/2, size, size);
          } else {
            // Triangle for correlation
            const size = point.size;
            ctx.moveTo(projected.x, projected.y - size);
            ctx.lineTo(projected.x - size, projected.y + size);
            ctx.lineTo(projected.x + size, projected.y + size);
            ctx.closePath();
          }
          
          ctx.fill();

          // Quantum interference patterns
          if (viewMode === 'quantum' && Math.random() < 0.1) {
            const waveRadius = 20 + Math.sin(Date.now() * 0.01 + index) * 10;
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(projected.x, projected.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
      });

      // Holographic scan lines
      if (viewMode === 'hologram') {
        const scanY = (Date.now() * 0.5) % canvas.height;
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(canvas.width, scanY);
        ctx.stroke();
      }

      requestAnimationFrame(render);
    };

    render();
  }, [layers, rotationX, rotationY, rotationZ, zoomLevel, viewMode]);

  // Mouse interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseDown(true);
    setAutoRotate(false);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseDown) return;
    
    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;
    
    setRotationY(prev => prev + deltaX * 0.01);
    setRotationX(prev => prev + deltaY * 0.01);
    
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setMouseDown(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    setZoomLevel(prev => Math.max(0.1, Math.min(3, prev + e.deltaY * -0.001)));
  };

  return (
    <Card className="bg-black border-gray-800 overflow-hidden">
      <CardContent className="p-0">
        {/* Holographic Controls */}
        <div className="p-4 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotateX: [0, 180, 360],
                  rotateY: [0, 180, 360]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
              >
                <Box className="h-5 w-5 text-cyan-400" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-white">Holographic 3D Analysis</h3>
                <p className="text-xs text-gray-400">Multi-dimensional Market Visualization</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-cyan-900/20 border-cyan-500/30 text-cyan-400">
                <Eye className="h-3 w-3 mr-1" />
                {viewMode.toUpperCase()}
              </Badge>
              
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs text-purple-400 font-mono"
              >
                ZOOM: {zoomLevel.toFixed(1)}x
              </motion.div>
            </div>
          </div>

          {/* View Mode Controls */}
          <div className="flex gap-2 mt-3">
            {[
              { mode: 'hologram', icon: Layers, color: 'cyan' },
              { mode: 'neural', icon: Brain, color: 'purple' },
              { mode: 'quantum', icon: Atom, color: 'blue' },
              { mode: 'temporal', icon: Orbit, color: 'green' }
            ].map(({ mode, icon: Icon, color }) => (
              <motion.button
                key={mode}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                  ${viewMode === mode 
                    ? `bg-${color}-500/20 text-${color}-400 border border-${color}-500/50` 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }
                `}
                onClick={() => setViewMode(mode as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-3 w-3" />
                {mode.toUpperCase()}
              </motion.button>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAutoRotate(!autoRotate)}
              className="border-orange-500/30 hover:border-orange-500"
            >
              <RotateCw className="h-3 w-3 mr-1" />
              {autoRotate ? 'Manual' : 'Auto'}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setRotationX(0);
                setRotationY(0);
                setRotationZ(0);
                setZoomLevel(1);
              }}
              className="border-orange-500/30 hover:border-orange-500"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* 3D Holographic Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full cursor-grab active:cursor-grabbing"
            style={{ maxWidth: '100%', height: '500px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />

          {/* Holographic Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 space-y-2">
              <Badge variant="outline" className="bg-black/80 border-cyan-500/50 text-cyan-400">
                <Zap className="h-3 w-3 mr-1" />
                Neural Frequency: {(layers.length * 847 + rotationY * 100).toFixed(0)}Hz
              </Badge>
              
              {selectedRune && (
                <Badge variant="outline" className="bg-black/80 border-purple-500/50 text-purple-400">
                  <Box className="h-3 w-3 mr-1" />
                  Target: {selectedRune.symbol}
                </Badge>
              )}
            </div>

            <div className="absolute top-4 right-4 text-right space-y-1">
              <div className="text-xs text-cyan-400 font-mono">
                ROT: [{rotationX.toFixed(2)}, {rotationY.toFixed(2)}, {rotationZ.toFixed(2)}]
              </div>
              <div className="text-xs text-purple-400 font-mono">
                LAYERS: {layers.length} • POINTS: {layers.reduce((sum, l) => sum + l.points.length, 0)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}