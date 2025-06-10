'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Node,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, BarChart3, TrendingUp, Shield, Cpu, Database, Network } from 'lucide-react';

// Custom Node Components
const AIAgentNode = ({ data }: { data: any }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'brain': return <Brain className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      case 'trading': return <TrendingUp className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'processing': return <Cpu className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'network': return <Network className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700 p-3 min-w-[180px] relative shadow-lg">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1 rounded ${getStatusColor(data.status)} text-white`}>
          {getIcon(data.type)}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white">{data.label}</h4>
          <p className="text-xs text-gray-400">{data.description}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Badge className={`text-xs ${
          data.status === 'active' ? 'bg-green-600' :
          data.status === 'processing' ? 'bg-blue-600' :
          data.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
        }`}>
          {data.status}
        </Badge>
        {data.performance && (
          <span className="text-xs text-green-400">{data.performance}%</span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </Card>
  );
};

// Custom node types
const nodeTypes: NodeTypes = {
  aiAgent: AIAgentNode,
};

export function AIFlowDiagram() {
  // Initial nodes configuration
  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'aiAgent',
      position: { x: 250, y: 50 },
      data: {
        label: 'Master AI Controller',
        description: 'Central coordination',
        status: 'active',
        type: 'brain',
        performance: 98
      },
    },
    {
      id: '2',
      type: 'aiAgent',
      position: { x: 50, y: 200 },
      data: {
        label: 'Market Analysis AI',
        description: 'Real-time market data',
        status: 'processing',
        type: 'analytics',
        performance: 94
      },
    },
    {
      id: '3',
      type: 'aiAgent',
      position: { x: 250, y: 200 },
      data: {
        label: 'Trading Strategy AI',
        description: 'Algorithm optimization',
        status: 'active',
        type: 'trading',
        performance: 96
      },
    },
    {
      id: '4',
      type: 'aiAgent',
      position: { x: 450, y: 200 },
      data: {
        label: 'Risk Management AI',
        description: 'Portfolio protection',
        status: 'active',
        type: 'security',
        performance: 99
      },
    },
    {
      id: '5',
      type: 'aiAgent',
      position: { x: 50, y: 350 },
      data: {
        label: 'Data Processing',
        description: 'Real-time pipelines',
        status: 'processing',
        type: 'processing',
        performance: 92
      },
    },
    {
      id: '6',
      type: 'aiAgent',
      position: { x: 250, y: 350 },
      data: {
        label: 'Database Manager',
        description: 'Data storage & retrieval',
        status: 'active',
        type: 'database',
        performance: 97
      },
    },
    {
      id: '7',
      type: 'aiAgent',
      position: { x: 450, y: 350 },
      data: {
        label: 'Network Monitor',
        description: 'System health check',
        status: 'warning',
        type: 'network',
        performance: 87
      },
    },
    {
      id: '8',
      type: 'aiAgent',
      position: { x: 650, y: 200 },
      data: {
        label: 'Execution Engine',
        description: 'Trade execution',
        status: 'active',
        type: 'trading',
        performance: 95
      },
    },
  ];

  // Initial edges configuration
  const initialEdges: Edge[] = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10B981', strokeWidth: 2 }
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3B82F6', strokeWidth: 2 }
    },
    {
      id: 'e1-4',
      source: '1',
      target: '4',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#F59E0B', strokeWidth: 2 }
    },
    {
      id: 'e2-5',
      source: '2',
      target: '5',
      type: 'smoothstep',
      style: { stroke: '#6B7280', strokeWidth: 1 }
    },
    {
      id: 'e3-6',
      source: '3',
      target: '6',
      type: 'smoothstep',
      style: { stroke: '#6B7280', strokeWidth: 1 }
    },
    {
      id: 'e4-7',
      source: '4',
      target: '7',
      type: 'smoothstep',
      style: { stroke: '#EF4444', strokeWidth: 2 }
    },
    {
      id: 'e3-8',
      source: '3',
      target: '8',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#8B5CF6', strokeWidth: 2 }
    },
    {
      id: 'e4-8',
      source: '4',
      target: '8',
      type: 'smoothstep',
      style: { stroke: '#6B7280', strokeWidth: 1 }
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const defaultViewport = { x: 0, y: 0, zoom: 0.8 };

  return (
    <Card className="bg-gray-900 border-gray-700 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          CYPHER AI Agent Network
        </h3>
        <p className="text-sm text-gray-400">
          Real-time visualization of AI agent interactions and system performance
        </p>
      </div>
      
      <div className="h-[500px] w-full bg-gray-950 rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultViewport={defaultViewport}
          fitView
          attributionPosition="top-right"
        >
          <MiniMap 
            className="bg-gray-800"
            nodeColor={(node) => {
              switch (node.data?.status) {
                case 'active': return '#10B981';
                case 'processing': return '#3B82F6';
                case 'warning': return '#F59E0B';
                case 'error': return '#EF4444';
                default: return '#6B7280';
              }
            }}
          />
          <Controls className="bg-gray-800 border-gray-600" />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="#374151"
          />
        </ReactFlow>
      </div>

      {/* Status Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-300">Active</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-300">Processing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-300">Warning</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-300">Error</span>
        </div>
      </div>
    </Card>
  );
}