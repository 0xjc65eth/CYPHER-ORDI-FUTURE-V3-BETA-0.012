'use client';

import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectNotifications,
  selectUnreadCount,
  selectNotificationSettings,
  selectNotificationPermission,
  updatePermission,
  clearExpiredNotifications,
  addNotification
} from '@/store/notificationSlice';
import { useNotificationInit } from '@/hooks/useNotificationInit';
import { ToastProvider } from './ToastProvider';
import { NotificationToast } from './NotificationToast';
import { NotificationCenter } from './NotificationCenter';
import { NotificationSound } from './NotificationSound';
import { CreateNotificationConfig } from '@/types/notifications';

interface NotificationSystemProps {
  children: React.ReactNode;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const settings = useAppSelector(selectNotificationSettings);
  const permission = useAppSelector(selectNotificationPermission);
  
  const soundRef = useRef<HTMLAudioElement | null>(null);
  const lastNotificationRef = useRef<string | null>(null);

  // Inicializar sistema de notificações
  useNotificationInit();

  useEffect(() => {
    // Verificar suporte a notificações do browser
    if ('Notification' in window) {
      dispatch(updatePermission(Notification.permission));
    }

    // Limpar notificações expiradas a cada minuto
    const cleanupInterval = setInterval(() => {
      dispatch(clearExpiredNotifications());
    }, 60000);

    // Função para lidar com visibilidade da página
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Página ficou visível, limpar notificações expiradas
        dispatch(clearExpiredNotifications());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(cleanupInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);

  // Solicitar permissão para notificações do browser
  const requestBrowserPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    dispatch(updatePermission(permission));
    return permission;
  };

  // Função para criar notificação do browser
  const createBrowserNotification = (config: CreateNotificationConfig) => {
    if (!settings.browserNotifications || permission !== 'granted') {
      return;
    }

    const typeSettings = settings.types[config.type];
    if (!typeSettings.browser) {
      return;
    }

    // Verificar se está em horário silencioso
    if (settings.quiet_hours.enabled && config.priority !== 'critical') {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [startHour, startMin] = settings.quiet_hours.start.split(':').map(Number);
      const [endHour, endMin] = settings.quiet_hours.end.split(':').map(Number);
      
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      
      const isQuiet = startTime < endTime 
        ? currentTime >= startTime && currentTime <= endTime
        : currentTime >= startTime || currentTime <= endTime;
        
      if (isQuiet) return;
    }

    const notification = new Notification(config.title, {
      body: config.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: config.type,
      requireInteraction: config.priority === 'critical',
      silent: !typeSettings.sound
    });

    // Auto-fechar após 5 segundos para notificações não críticas
    if (config.priority !== 'critical') {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Handler para click na notificação
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Executar ação padrão se existir
      if (config.actions && config.actions.length > 0) {
        config.actions[0].action();
      }
    };
  };

  // Monitorar novas notificações para criar notificações do browser
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Evitar duplicatas
      if (lastNotificationRef.current !== latestNotification.id) {
        lastNotificationRef.current = latestNotification.id;
        
        // Criar notificação do browser se configurado
        const typeSettings = settings.types[latestNotification.type];
        if (typeSettings.browser && permission === 'granted') {
          createBrowserNotification({
            type: latestNotification.type,
            title: latestNotification.title,
            message: latestNotification.message,
            priority: latestNotification.priority,
            actions: latestNotification.actions
          });
        }
      }
    }
  }, [notifications, settings, permission]);

  // API pública para criar notificações
  const createNotification = (config: CreateNotificationConfig) => {
    dispatch(addNotification(config));
  };

  // Expor API globalmente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).NotificationAPI = {
        create: createNotification,
        requestPermission: requestBrowserPermission,
        getUnreadCount: () => unreadCount,
        getSettings: () => settings
      };
    }
  }, [unreadCount, settings]);

  return (
    <ToastProvider>
      {children}
      
      {/* Toast notifications para notificações recentes */}
      {notifications
        .filter(n => !n.read)
        .slice(0, 3) // Mostrar apenas as 3 mais recentes
        .map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
          />
        ))}
      
      {/* Som das notificações */}
      <NotificationSound />
      
      {/* Centro de notificações (será ativado via botão no header) */}
      <NotificationCenter />
    </ToastProvider>
  );
};

// Hook personalizado para usar notificações
export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const settings = useAppSelector(selectNotificationSettings);
  const permission = useAppSelector(selectNotificationPermission);

  const createNotification = (config: CreateNotificationConfig) => {
    dispatch(addNotification(config));
  };

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    dispatch(updatePermission(permission));
    return permission;
  };

  return {
    notifications,
    unreadCount,
    settings,
    permission,
    createNotification,
    requestPermission
  };
};

// Templates de notificações comuns
export const NotificationTemplates = {
  priceAlert: (symbol: string, currentPrice: number, targetPrice: number, direction: 'above' | 'below'): CreateNotificationConfig => ({
    type: 'price_alert',
    title: `Alerta de Preço - ${symbol}`,
    message: `${symbol} está ${direction === 'above' ? 'acima' : 'abaixo'} de $${targetPrice.toLocaleString()}. Preço atual: $${currentPrice.toLocaleString()}`,
    priority: 'high',
    metadata: {
      symbol,
      currentPrice,
      targetPrice,
      direction,
      percentage: ((currentPrice - targetPrice) / targetPrice * 100)
    },
    actions: [
      {
        label: 'Ver Gráfico',
        action: () => {
          window.location.href = `/trading?symbol=${symbol}`;
        }
      }
    ]
  }),

  arbitrageOpportunity: (symbol: string, exchanges: string[], spread: number, volume: number): CreateNotificationConfig => ({
    type: 'arbitrage_opportunity',
    title: 'Oportunidade de Arbitragem',
    message: `${symbol}: Spread de ${spread.toFixed(2)}% entre ${exchanges.join(' e ')}. Volume: $${volume.toLocaleString()}`,
    priority: 'high',
    metadata: {
      symbol,
      exchanges,
      spread,
      volume,
      potential_profit: volume * (spread / 100)
    },
    expiresIn: 5, // 5 minutos
    actions: [
      {
        label: 'Ver Detalhes',
        action: () => {
          window.location.href = `/arbitrage?symbol=${symbol}`;
        }
      }
    ]
  }),

  tradingSignal: (symbol: string, signal: 'buy' | 'sell' | 'hold', confidence: number): CreateNotificationConfig => ({
    type: 'trading_signal',
    title: `Sinal de Trading - ${symbol}`,
    message: `${signal.toUpperCase()} recomendado para ${symbol} com ${confidence}% de confiança`,
    priority: confidence > 80 ? 'high' : 'medium',
    metadata: {
      symbol,
      signal,
      confidence,
      indicators: ['RSI', 'MACD', 'EMA'],
      timeframe: '1h'
    },
    actions: [
      {
        label: 'Executar Trade',
        action: () => {
          window.location.href = `/trading?symbol=${symbol}&action=${signal}`;
        }
      }
    ]
  }),

  portfolioUpdate: (change: number, percentage: number): CreateNotificationConfig => ({
    type: 'portfolio_update',
    title: 'Atualização do Portfolio',
    message: `Seu portfolio ${change > 0 ? 'ganhou' : 'perdeu'} $${Math.abs(change).toLocaleString()} (${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%) hoje`,
    priority: 'medium',
    metadata: {
      change,
      percentage,
      period: '24h'
    },
    actions: [
      {
        label: 'Ver Portfolio',
        action: () => {
          window.location.href = '/portfolio';
        }
      }
    ]
  }),

  systemError: (message: string, details?: string): CreateNotificationConfig => ({
    type: 'error',
    title: 'Erro do Sistema',
    message,
    priority: 'high',
    persistent: true,
    metadata: {
      details,
      timestamp: Date.now()
    },
    actions: [
      {
        label: 'Reportar Erro',
        action: () => {
          window.location.href = '/support';
        }
      }
    ]
  })
};

export default NotificationSystem;