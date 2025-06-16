'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useBitcoinPrice } from '@/hooks/cache';
import { devLogger } from '@/lib/logger';

interface PriceAlert {
  id: string;
  price: number;
  direction: 'above' | 'below';
  triggered: boolean;
}

// Hook para monitorar preço e disparar alertas
export function usePriceAlerts() {
  const { addNotification, settings } = useNotifications();
  const { data: btcPrice } = useBitcoinPrice();

  useEffect(() => {
    if (!btcPrice || !settings.priceAlerts) return;

    // Check stored price alerts
    const alertsJson = localStorage.getItem('priceAlerts');
    if (!alertsJson) return;

    const alerts: PriceAlert[] = JSON.parse(alertsJson);
    const updatedAlerts = alerts.map(alert => {
      if (alert.triggered) return alert;

      const shouldTrigger = 
        (alert.direction === 'above' && btcPrice.price >= alert.price) ||
        (alert.direction === 'below' && btcPrice.price <= alert.price);

      if (shouldTrigger) {
        addNotification({
          type: 'price',
          title: 'Price Alert Triggered!',
          message: `Bitcoin is now ${alert.direction} $${alert.price.toLocaleString()} at $${btcPrice.price.toLocaleString()}`,
          action: {
            label: 'View Market',
            onClick: () => window.location.href = '/market',
          },
        });

        devLogger.log('PRICE_ALERT', `Alert triggered: BTC ${alert.direction} $${alert.price}`);
        return { ...alert, triggered: true };
      }

      return alert;
    });

    // Update alerts in storage
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
  }, [btcPrice, addNotification, settings.priceAlerts]);
}
// Hook para monitorar oportunidades de arbitragem
export function useArbitrageAlerts() {
  const { addNotification, settings } = useNotifications();

  useEffect(() => {
    if (!settings.arbitrageAlerts) return;

    // Simular detecção de arbitragem (em produção seria real)
    const checkArbitrage = () => {
      const random = Math.random();
      if (random > 0.95) { // 5% chance de detectar oportunidade
        const opportunity = {
          exchange1: 'Binance',
          exchange2: 'Coinbase',
          priceDiff: Math.random() * 500 + 100,
          profitPercent: Math.random() * 2 + 0.5,
        };

        addNotification({
          type: 'arbitrage',
          title: 'Arbitrage Opportunity Detected!',
          message: `${opportunity.profitPercent.toFixed(2)}% profit between ${opportunity.exchange1} and ${opportunity.exchange2}`,
          data: opportunity,
          action: {
            label: 'View Details',
            onClick: () => window.location.href = '/trading',
          },
        });

        devLogger.log('ARBITRAGE', 'New opportunity detected', opportunity);
      }
    };

    const interval = setInterval(checkArbitrage, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [addNotification, settings.arbitrageAlerts]);
}

// Hook para neural insights
export function useNeuralInsights() {
  const { addNotification, settings } = useNotifications();

  useEffect(() => {
    if (!settings.neuralInsights) return;

    // Simular insights neurais
    const generateInsight = () => {
      const insights = [
        { 
          title: 'Bullish Pattern Detected',
          message: 'Neural network detected ascending triangle formation with 78% confidence',
        },
        {
          title: 'Market Sentiment Shift',
          message: 'Social sentiment turning bullish, expecting price movement in 4-6 hours',
        },
        {
          title: 'Whale Activity Alert',
          message: 'Large accumulation detected: 500+ BTC moved to cold storage',
        },
      ];

      const random = Math.random();
      if (random > 0.9) { // 10% chance
        const insight = insights[Math.floor(Math.random() * insights.length)];
        
        addNotification({
          type: 'neural',
          title: insight.title,
          message: insight.message,
          action: {
            label: 'Analyze',
            onClick: () => window.location.href = '/analytics',
          },
        });

        devLogger.log('NEURAL', 'New insight generated', insight);
      }
    };

    const interval = setInterval(generateInsight, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [addNotification, settings.neuralInsights]);
}