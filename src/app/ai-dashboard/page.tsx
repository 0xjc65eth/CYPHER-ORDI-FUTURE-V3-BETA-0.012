/**
 * 🧠 AI DASHBOARD PAGE - CYPHER AI v3.0
 * Dashboard completo de IA e machine learning
 */

import React from 'react';
import { RealTimeMonitor } from '@/components/trading/RealTimeMonitor';
import { AIAnalytics } from '@/components/trading/AIAnalytics';
import { VoiceControlPanel } from '@/components/trading/VoiceControlPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function AIDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🧠 AI Control Center
          </h1>
          <p className="text-gray-400 text-lg">
            Advanced AI analytics, monitoring, and voice control
          </p>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="monitor" className="space-y-4">
          <TabsList className="grid grid-cols-3 bg-gray-800 w-full max-w-md mx-auto">
            <TabsTrigger value="monitor">Real-Time Monitor</TabsTrigger>
            <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
            <TabsTrigger value="voice">Voice Control</TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="space-y-6">
            <RealTimeMonitor />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AIAnalytics />
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <VoiceControlPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}