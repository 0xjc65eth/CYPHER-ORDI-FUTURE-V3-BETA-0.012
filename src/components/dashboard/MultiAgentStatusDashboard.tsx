'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle, Zap } from 'lucide-react';
import useMultiAgent from '@/hooks/useMultiAgent';

export const MultiAgentStatusDashboard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { agents, systemStats, isLoading } = useMultiAgent();

  if (isLoading) {
    return (
      <Card className={`bg-gray-800 border-gray-700 ${className}`}>
        <CardContent className="flex items-center justify-center h-32">
          <Activity className="w-6 h-6 text-orange-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gray-800 border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-400" />
          Multi-Agent System
        </CardTitle>
        {systemStats && (
          <div className="text-sm text-gray-400">
            {systemStats.totalAgents} agents • {systemStats.activeAgents} active
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {agents.slice(0, 6).map((agent) => (
            <div key={agent.id} className="p-2 bg-gray-900 rounded text-center">
              <CheckCircle className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-white font-mono">{agent.id}</p>
              <p className="text-xs text-gray-400 truncate">{agent.name}</p>
            </div>
          ))}
        </div>        
        {agents.length > 6 && (
          <p className="text-xs text-gray-500 text-center mt-3">
            +{agents.length - 6} more agents active
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiAgentStatusDashboard;