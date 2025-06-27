'use client';

import React from 'react';
import CypherAIV2 from '@/components/ai/CypherAIV2Client';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Mic, BarChart3, Shield, Zap } from 'lucide-react';

export default function CypherAIV2Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fundo animado */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500/50 rounded-full"
              initial={{
                x: Math.random() * 1200,
                y: Math.random() * 800,
              }}
              animate={{
                x: Math.random() * 1200,
                y: Math.random() * 800,
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="flex justify-center items-center gap-4 mb-6">
            <Brain className="h-16 w-16 text-purple-500" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              CYPHER AI v2
            </h1>
            <Sparkles className="h-16 w-16 text-yellow-500 animate-pulse" />
          </div>
          
          <p className="text-xl text-gray-400 mb-8">
            Assistente de Cripto com IA Avançada e Comando de Voz
          </p>

          {/* Features */}
          <div className="flex justify-center gap-8 mb-12">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg"
            >
              <Mic className="h-5 w-5 text-red-500" />
              <span>Comando de Voz</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg"
            >
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span>Análise em Tempo Real</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg"
            >
              <Shield className="h-5 w-5 text-blue-500" />
              <span>Trading Seguro</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg"
            >
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Respostas Instantâneas</span>
            </motion.div>
          </div>
        </motion.div>

        {/* CYPHER AI Component */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="container mx-auto px-4 pb-12"
        >
          <CypherAIV2 />
        </motion.div>

        {/* Instruções */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="container mx-auto px-4 pb-12 max-w-4xl"
        >
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-lg p-6 border border-gray-800">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-500" />
              Como usar a CYPHER AI v2
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-purple-400">
                  🎙️ Comandos de Voz
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• "Qual o preço do Bitcoin?"</li>
                  <li>• "Análise técnica do Ethereum"</li>
                  <li>• "Comprar 10 dólares em BTC"</li>
                  <li>• "Mostrar meu portfolio"</li>
                  <li>• "Criar alerta quando BTC chegar a 100k"</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-purple-400">
                  💡 Recursos Avançados
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• Análise de sentimento de mercado</li>
                  <li>• Detecção de padrões gráficos</li>
                  <li>• Alertas inteligentes</li>
                  <li>• Execução automática de ordens</li>
                  <li>• Suporte multi-idiomas</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
              <p className="text-sm text-purple-300">
                <strong>Dica Pro:</strong> Ative o modo contínuo (ícone de fone) para conversar 
                naturalmente sem precisar clicar no microfone toda vez. A CYPHER AI vai entender 
                quando você está falando com ela! 🚀
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}