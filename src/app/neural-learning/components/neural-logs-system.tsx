'use client'

import React, { useState, useEffect } from 'react'
import { Card, Title, Text, Badge, Flex } from '@tremor/react'
import { RiFileList3Line, RiTimeLine, RiInformationLine, RiErrorWarningLine, RiCheckboxCircleLine, RiRefreshLine } from 'react-icons/ri'

// Tipos de logs
type LogLevel = 'info' | 'warning' | 'error' | 'success'

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  module: string
  message: string
  details?: string
  relatedData?: any
}

// Dados simulados de logs
const generateLogs = (): LogEntry[] => {
  const now = new Date()
  
  return [
    {
      id: `log-${Date.now()}-1`,
      timestamp: new Date(now.getTime() - 35000).toISOString(),
      level: 'info',
      module: 'DataCollection',
      message: 'Iniciando coleta de dados de mercado',
      details: 'Conectando às APIs: CoinMarketCap, CoinGecko, Mempool.space'
    },
    {
      id: `log-${Date.now()}-2`,
      timestamp: new Date(now.getTime() - 32000).toISOString(),
      level: 'success',
      module: 'DataCollection',
      message: 'Dados de mercado coletados com sucesso',
      details: 'Obtidos 1,250 pontos de dados de preço e volume'
    },
    {
      id: `log-${Date.now()}-3`,
      timestamp: new Date(now.getTime() - 30000).toISOString(),
      level: 'info',
      module: 'NeuralTraining',
      message: 'Iniciando treinamento do modelo de previsão de preços',
      details: 'Usando 80% dos dados para treinamento, 20% para validação'
    },
    {
      id: `log-${Date.now()}-4`,
      timestamp: new Date(now.getTime() - 25000).toISOString(),
      level: 'warning',
      module: 'DataValidation',
      message: 'Detectada anomalia nos dados de volume do Ordinal Bitcoin Puppets',
      details: 'Volume reportado 320% acima da média histórica'
    },
    {
      id: `log-${Date.now()}-5`,
      timestamp: new Date(now.getTime() - 20000).toISOString(),
      level: 'info',
      module: 'AutoCorrection',
      message: 'Iniciando correção automática de dados anômalos',
      details: 'Aplicando algoritmo de detecção de outliers'
    },
    {
      id: `log-${Date.now()}-6`,
      timestamp: new Date(now.getTime() - 18000).toISOString(),
      level: 'success',
      module: 'AutoCorrection',
      message: 'Dados corrigidos com sucesso',
      details: 'Volume ajustado de 1,250,000 para 850,000 com 88% de confiança'
    },
    {
      id: `log-${Date.now()}-7`,
      timestamp: new Date(now.getTime() - 15000).toISOString(),
      level: 'error',
      module: 'ArbitrageCalculation',
      message: 'Erro no cálculo de margem de lucro para arbitragem',
      details: 'Taxas de mercado não foram incluídas no cálculo inicial'
    },
    {
      id: `log-${Date.now()}-8`,
      timestamp: new Date(now.getTime() - 12000).toISOString(),
      level: 'info',
      module: 'AutoCorrection',
      message: 'Iniciando correção de cálculos de arbitragem',
      details: 'Recalculando margens de lucro com inclusão de taxas'
    },
    {
      id: `log-${Date.now()}-9`,
      timestamp: new Date(now.getTime() - 10000).toISOString(),
      level: 'success',
      module: 'ArbitrageCalculation',
      message: 'Cálculos de arbitragem corrigidos',
      details: 'Margem de lucro ajustada de 28.5% para 12.3% após inclusão de taxas'
    },
    {
      id: `log-${Date.now()}-10`,
      timestamp: new Date(now.getTime() - 8000).toISOString(),
      level: 'info',
      module: 'CloudSync',
      message: 'Iniciando sincronização com armazenamento na nuvem',
      details: 'Enviando modelos treinados e dados processados para Degoo Cloud'
    },
    {
      id: `log-${Date.now()}-11`,
      timestamp: new Date(now.getTime() - 5000).toISOString(),
      level: 'success',
      module: 'CloudSync',
      message: 'Sincronização com a nuvem concluída',
      details: 'Transferidos 125MB de dados para o armazenamento Degoo'
    },
    {
      id: `log-${Date.now()}-12`,
      timestamp: new Date(now.getTime() - 2000).toISOString(),
      level: 'info',
      module: 'NeuralTraining',
      message: 'Continuando treinamento do modelo com dados corrigidos',
      details: 'Época atual: 15/20, Precisão: 91.2%, Recall: 83.9%'
    }
  ]
}

export function NeuralLogsSystem() {
  const [logs, setLogs] = useState<LogEntry[]>(generateLogs())
  const [filter, setFilter] = useState<LogLevel | 'all'>('all')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  
  // Adicionar novos logs periodicamente para simular atividade
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: ['info', 'success', 'warning', 'error'][Math.floor(Math.random() * 4)] as LogLevel,
        module: ['DataCollection', 'NeuralTraining', 'AutoCorrection', 'CloudSync', 'ArbitrageCalculation'][Math.floor(Math.random() * 5)],
        message: `Atividade do sistema neural em ${new Date().toLocaleTimeString()}`,
        details: `Detalhes da operação executada às ${new Date().toLocaleTimeString()}`
      }
      
      setLogs(prev => [newLog, ...prev.slice(0, 19)])
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])
  
  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter)
    
  const getLevelColor = (level: LogLevel) => {
    switch(level) {
      case 'info': return 'text-blue-400 bg-blue-400/20'
      case 'success': return 'text-emerald-400 bg-emerald-400/20'
      case 'warning': return 'text-amber-400 bg-amber-400/20'
      case 'error': return 'text-red-400 bg-red-400/20'
    }
  }
  
  const getLevelIcon = (level: LogLevel) => {
    switch(level) {
      case 'info': return <RiInformationLine className="w-4 h-4" />
      case 'success': return <RiCheckboxCircleLine className="w-4 h-4" />
      case 'warning': return <RiErrorWarningLine className="w-4 h-4" />
      case 'error': return <RiErrorWarningLine className="w-4 h-4" />
    }
  }
  
  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3 border border-[#8B5CF6]/30">
            <RiFileList3Line className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <Title className="text-white text-xl">Logs Detalhados do Sistema Neural</Title>
        </div>
        
        <button
          className="flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30"
          onClick={() => setLogs(generateLogs())}
        >
          <RiRefreshLine className="mr-1" />
          Atualizar Logs
        </button>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-3 py-1 rounded-md text-xs font-medium ${filter === 'all' ? 'bg-[#8B5CF6] text-white' : 'bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30'}`}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        <button
          className={`px-3 py-1 rounded-md text-xs font-medium ${filter === 'info' ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'}`}
          onClick={() => setFilter('info')}
        >
          Info
        </button>
        <button
          className={`px-3 py-1 rounded-md text-xs font-medium ${filter === 'success' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
          onClick={() => setFilter('success')}
        >
          Sucesso
        </button>
        <button
          className={`px-3 py-1 rounded-md text-xs font-medium ${filter === 'warning' ? 'bg-amber-500 text-white' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'}`}
          onClick={() => setFilter('warning')}
        >
          Aviso
        </button>
        <button
          className={`px-3 py-1 rounded-md text-xs font-medium ${filter === 'error' ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
          onClick={() => setFilter('error')}
        >
          Erro
        </button>
      </div>
      
      <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20 max-h-[400px] overflow-y-auto">
        <div className="space-y-2">
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <div 
                key={log.id} 
                className={`bg-[#8B5CF6]/20 p-3 rounded-lg cursor-pointer hover:bg-[#8B5CF6]/30 transition-colors ${expandedLog === log.id ? 'border border-[#8B5CF6]' : ''}`}
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full ${getLevelColor(log.level)} flex items-center justify-center mr-2`}>
                      {getLevelIcon(log.level)}
                    </div>
                    <div>
                      <Text className="text-white text-sm font-medium">{log.message}</Text>
                      <div className="flex items-center text-xs text-gray-400">
                        <Badge className={`mr-2 ${getLevelColor(log.level)}`}>
                          {log.module}
                        </Badge>
                        <div className="flex items-center">
                          <RiTimeLine className="w-3 h-3 mr-1" />
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {expandedLog === log.id && log.details && (
                  <div className="mt-2 pt-2 border-t border-[#8B5CF6]/30">
                    <Text className="text-gray-300 text-xs">{log.details}</Text>
                    
                    {log.relatedData && (
                      <div className="mt-2 bg-[#8B5CF6]/10 p-2 rounded">
                        <Text className="text-xs text-gray-400">Dados relacionados:</Text>
                        <pre className="text-xs text-white mt-1 overflow-x-auto">
                          {JSON.stringify(log.relatedData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <Text className="text-gray-400">Nenhum log encontrado com o filtro atual</Text>
            </div>
          )}
        </div>
      </div>
      
      <Flex className="mt-3">
        <Text className="text-xs text-gray-400">Total de logs: {filteredLogs.length}</Text>
        <Text className="text-xs text-gray-400">Última atualização: {new Date().toLocaleTimeString()}</Text>
      </Flex>
    </Card>
  )
}
