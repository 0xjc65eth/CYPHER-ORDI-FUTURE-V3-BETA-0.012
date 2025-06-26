'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from './NotificationSystem';
import { notify, notificationService } from '@/services/notification-service';

// Componente de demonstração do sistema de notificações
export const NotificationDemo: React.FC = () => {
  const { createNotification, requestPermission } = useNotifications();

  // Demonstrações de diferentes tipos de notificação
  const demoNotifications = {
    priceAlert: () => {
      notify.priceAlert('BTC', 48500, 50000, 'above');
    },

    arbitrage: () => {
      notify.arbitrage('BTC', ['Binance', 'Coinbase'], 2.5, 150000);
    },

    tradingSignal: () => {
      notify.trading('BTC', 'buy', 85, ['RSI', 'MACD', 'EMA']);
    },

    portfolio: () => {
      notify.portfolio(2500, 5.2, '24h');
    },

    news: () => {
      notify.news(
        'SEC Aprova ETF de Bitcoin',
        'A Securities and Exchange Commission aprovou oficialmente o primeiro ETF de Bitcoin spot.',
        'CoinDesk',
        'high',
        'https://example.com/news'
      );
    },

    success: () => {
      notify.success('Trade Executado', 'Sua ordem de compra de 0.1 BTC foi executada com sucesso!');
    },

    error: () => {
      notify.error('Erro de Conexão', 'Falha ao conectar com a exchange. Tentando reconectar...');
    },

    warning: () => {
      notify.warning('Volatilidade Alta', 'BTC apresenta alta volatilidade. Considere revisar suas posições.');
    },

    info: () => {
      notify.info('Manutenção Programada', 'Sistema entrará em manutenção às 02:00 UTC por 30 minutos.');
    }
  };

  // Demonstrações de monitoramento
  const demoMonitoring = {
    startPriceAlert: () => {
      const alertId = notificationService.startPriceMonitoring('BTC', 50000, 'above', 10000);
      notify.info('Alerta de Preço Ativado', `Monitorando BTC > $50,000 (ID: ${alertId})`);
    },

    startArbitrageScanner: () => {
      notificationService.startArbitrageScanner(['BTC', 'ETH'], ['Binance', 'Coinbase', 'Kraken'], 30000);
      notify.info('Scanner de Arbitragem', 'Scanner ativado para BTC e ETH em 3 exchanges');
    },

    startPortfolioMonitoring: () => {
      notificationService.startPortfolioMonitoring(60000);
      notify.info('Monitoramento de Portfolio', 'Monitoramento ativado com verificações a cada minuto');
    }
  };

  const handleRequestPermission = async () => {
    const permission = await requestPermission();
    if (permission === 'granted') {
      notify.success('Permissão Concedida', 'Notificações do browser habilitadas!');
    } else {
      notify.warning('Permissão Negada', 'Notificações do browser não estão disponíveis');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Sistema de Notificações - Demo</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Teste os diferentes tipos de notificações e funcionalidades do sistema.
        </p>
      </div>

      {/* Permissão do Browser */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Permissão do Browser</h3>
        <Button onClick={handleRequestPermission} className="mb-2">
          Solicitar Permissão para Notificações
        </Button>
        <p className="text-sm text-gray-500">
          Necessário para exibir notificações quando a página não estiver ativa.
        </p>
      </div>

      {/* Tipos de Notificação */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Tipos de Notificação</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            onClick={demoNotifications.priceAlert}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            💰 Alerta de Preço
          </Button>
          
          <Button 
            variant="outline" 
            onClick={demoNotifications.arbitrage}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            📈 Arbitragem
          </Button>
          
          <Button 
            variant="outline" 
            onClick={demoNotifications.tradingSignal}
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            📊 Sinal de Trading
          </Button>
          
          <Button 
            variant="outline" 
            onClick={demoNotifications.portfolio}
            className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
          >
            💼 Portfolio
          </Button>
          
          <Button 
            variant="outline" 
            onClick={demoNotifications.news}
            className="text-amber-600 border-amber-600 hover:bg-amber-50"
          >
            📰 Notícia
          </Button>
          
          <Button 
            variant="outline" 
            onClick={demoNotifications.success}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            ✅ Sucesso
          </Button>
          
          <Button 
            variant="outline" 
            onClick={demoNotifications.error}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            ❌ Erro
          </Button>
          
          <Button 
            variant="outline" 
            onClick={demoNotifications.warning}
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
          >
            ⚠️ Aviso
          </Button>
          
          <Button 
            variant="outline" 
            onClick={demoNotifications.info}
            className="text-gray-600 border-gray-600 hover:bg-gray-50"
          >
            ℹ️ Informação
          </Button>
        </div>
      </div>

      {/* Monitoramento Automático */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Monitoramento Automático</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button 
            variant="default" 
            onClick={demoMonitoring.startPriceAlert}
            className="bg-blue-600 hover:bg-blue-700"
          >
            🎯 Ativar Alerta de Preço
          </Button>
          
          <Button 
            variant="default" 
            onClick={demoMonitoring.startArbitrageScanner}
            className="bg-green-600 hover:bg-green-700"
          >
            🔍 Scanner de Arbitragem
          </Button>
          
          <Button 
            variant="default" 
            onClick={demoMonitoring.startPortfolioMonitoring}
            className="bg-purple-600 hover:bg-purple-700"
          >
            📊 Monitorar Portfolio
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Estes botões ativam monitoramento automático que gerará notificações baseadas em condições reais.
        </p>
      </div>

      {/* Notificação Customizada */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Notificação Customizada</h3>
        <Button 
          onClick={() => {
            createNotification({
              type: 'info',
              title: 'Notificação Customizada',
              message: 'Esta é uma notificação criada com configurações personalizadas',
              priority: 'medium',
              persistent: true,
              actions: [
                {
                  label: 'Ação 1',
                  action: () => alert('Ação 1 executada!')
                },
                {
                  label: 'Ação 2',
                  action: () => alert('Ação 2 executada!'),
                  variant: 'destructive'
                }
              ],
              metadata: {
                customField: 'valor personalizado',
                timestamp: Date.now()
              },
              expiresIn: 30, // 30 minutos
              sound: true,
              browserNotification: true
            });
          }}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          🎨 Criar Notificação Customizada
        </Button>
      </div>

      {/* Informações de Uso */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
          💡 Como Usar
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• <strong>Toast Notifications:</strong> Aparecem automaticamente no canto inferior direito</li>
          <li>• <strong>Central de Notificações:</strong> Clique no ícone de sino no navbar para ver todas</li>
          <li>• <strong>Som:</strong> Notificações reproduzem sons únicos baseados no tipo</li>
          <li>• <strong>Browser Notifications:</strong> Aparecem mesmo quando a aba não está ativa</li>
          <li>• <strong>Persistência:</strong> Notificações são salvas automaticamente no localStorage</li>
          <li>• <strong>Configurações:</strong> Personalize cada tipo na aba "Configurações" da central</li>
        </ul>
      </div>

      {/* APIs Disponíveis */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold mb-3 text-green-900 dark:text-green-100">
          🔧 APIs Disponíveis
        </h3>
        <div className="space-y-2 text-sm font-mono text-green-800 dark:text-green-200">
          <div>• <code>notify.success('título', 'mensagem')</code></div>
          <div>• <code>notify.error('título', 'mensagem')</code></div>
          <div>• <code>notify.priceAlert(symbol, current, target, direction)</code></div>
          <div>• <code>notificationService.startPriceMonitoring(...)</code></div>
          <div>• <code>useNotifications()</code> - Hook React</div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;