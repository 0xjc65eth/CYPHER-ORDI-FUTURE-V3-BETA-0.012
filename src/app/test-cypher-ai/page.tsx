'use client';

import CypherAI from '@/components/ai/CypherAI';

export default function TestCypherAIPage() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-orange-500 font-mono mb-2">
            CYPHER AI - Enhanced Test
          </h1>
          <p className="text-orange-400/80">
            Testing the enhanced Brazilian AI with voice and real-time features
          </p>
        </div>
        
        <CypherAI />
        
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-orange-500/30">
          <h3 className="text-lg font-bold text-orange-500 mb-3 font-mono">
            ✨ Enhanced Features
          </h3>
          <ul className="space-y-2 text-orange-400/80 text-sm">
            <li>🇧🇷 <strong>Personalidade Brasileira Autêntica</strong> - Gírias e linguagem casual</li>
            <li>🎙️ <strong>Interação por Voz</strong> - Reconhecimento de fala em português</li>
            <li>🔊 <strong>ElevenLabs TTS</strong> - Síntese de voz com emoções</li>
            <li>📈 <strong>Dados em Tempo Real</strong> - WebSocket para preços atualizados</li>
            <li>🤖 <strong>GPT-4 Integrado</strong> - Conversas naturais e inteligentes</li>
            <li>⚡ <strong>Trading Bot</strong> - Sinais automáticos e oportunidades</li>
            <li>📊 <strong>Analytics Dashboard</strong> - Métricas de performance</li>
            <li>📱 <strong>Interface Bloomberg</strong> - Estilo terminal profissional</li>
          </ul>
        </div>
        
        <div className="mt-4 p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
          <h4 className="text-orange-500 font-mono font-bold mb-2">🎯 Como Testar:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="text-orange-400 font-semibold mb-1">Comandos de Voz:</h5>
              <ul className="text-orange-400/70 space-y-1">
                <li>• "Como tá o Bitcoin?"</li>
                <li>• "Análise de mercado"</li>
                <li>• "Encontrar arbitragem"</li>
                <li>• "Ver meu portfólio"</li>
              </ul>
            </div>
            <div>
              <h5 className="text-orange-400 font-semibold mb-1">Recursos:</h5>
              <ul className="text-orange-400/70 space-y-1">
                <li>• Upload de áudio</li>
                <li>• Chat em tempo real</li>
                <li>• Dados de mercado live</li>
                <li>• Oportunidades de trading</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}