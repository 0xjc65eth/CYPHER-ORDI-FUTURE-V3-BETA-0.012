'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, AlertTriangle } from 'lucide-react';

export default function RiskManagement() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center gap-4 mb-6">
        <Zap className="h-8 w-8 text-pink-500" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
          RISK MANAGEMENT
        </h1>
      </div>
      
      <Card className="bg-black/50 border-pink-500/30">
        <CardContent className="p-8 text-center">
          <Shield className="h-16 w-16 text-pink-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Portfolio Risk Analysis</h2>
          <p className="text-gray-400">Advanced risk metrics and management tools</p>
          <Badge className="mt-4 bg-pink-500/20 border-pink-500 text-pink-400">
            In Development
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}