'use client';

import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '@/store';
import { selectNotifications, selectNotificationSettings } from '@/store/notificationSlice';

// Sons para diferentes tipos de notificação
const NOTIFICATION_SOUNDS = {
  price_alert: {
    frequency: 800,
    duration: 200,
    pattern: [1, 0.2, 1, 0.2, 1]
  },
  arbitrage_opportunity: {
    frequency: 1000,
    duration: 150,
    pattern: [1, 0.1, 1, 0.1, 1, 0.1, 1]
  },
  trading_signal: {
    frequency: 600,
    duration: 300,
    pattern: [1, 0.3, 0.7, 0.3, 1]
  },
  portfolio_update: {
    frequency: 500,
    duration: 250,
    pattern: [1, 0.4, 0.8]
  },
  news: {
    frequency: 400,
    duration: 200,
    pattern: [1, 0.5, 0.7]
  },
  system: {
    frequency: 700,
    duration: 150,
    pattern: [1, 0.2, 1]
  },
  error: {
    frequency: 300,
    duration: 400,
    pattern: [1, 0.1, 1, 0.1, 1, 0.1, 1]
  },
  success: {
    frequency: 800,
    duration: 200,
    pattern: [1, 0.3, 1.2]
  },
  warning: {
    frequency: 600,
    duration: 300,
    pattern: [1, 0.2, 0.8, 0.2, 1]
  },
  info: {
    frequency: 500,
    duration: 200,
    pattern: [1]
  }
};

export const NotificationSound: React.FC = () => {
  const notifications = useAppSelector(selectNotifications);
  const settings = useAppSelector(selectNotificationSettings);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastNotificationIdRef = useRef<string | null>(null);

  // Inicializar AudioContext
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('AudioContext não suportado:', error);
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Função para reproduzir som
  const playNotificationSound = (type: keyof typeof NOTIFICATION_SOUNDS) => {
    if (!audioContextRef.current || !settings.sound) {
      return;
    }

    const soundConfig = NOTIFICATION_SOUNDS[type];
    if (!soundConfig) {
      return;
    }

    const audioContext = audioContextRef.current;
    
    // Verificar se o contexto está suspenso (política de autoplay)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Criar oscillador para cada nota no padrão
    soundConfig.pattern.forEach((volume, index) => {
      const startTime = audioContext.currentTime + (index * soundConfig.duration / 1000);
      
      // Oscillador principal
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configurar frequência e forma de onda
      oscillator.frequency.setValueAtTime(soundConfig.frequency * volume, startTime);
      oscillator.type = 'sine';
      
      // Envelope ADSR simples
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.05, startTime + soundConfig.duration / 2000);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + soundConfig.duration / 1000);
      
      // Iniciar e parar o oscillador
      oscillator.start(startTime);
      oscillator.stop(startTime + soundConfig.duration / 1000);
    });
  };

  // Monitorar novas notificações para reproduzir som
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Verificar se é uma nova notificação
      if (lastNotificationIdRef.current !== latestNotification.id) {
        lastNotificationIdRef.current = latestNotification.id;
        
        // Verificar configurações de som
        const typeSettings = settings.types[latestNotification.type];
        if (settings.enabled && typeSettings.enabled && typeSettings.sound) {
          
          // Verificar horário silencioso
          if (!settings.quiet_hours.enabled || latestNotification.priority === 'critical') {
            playNotificationSound(latestNotification.type);
          } else {
            // Verificar se está em horário silencioso
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            
            const [startHour, startMin] = settings.quiet_hours.start.split(':').map(Number);
            const [endHour, endMin] = settings.quiet_hours.end.split(':').map(Number);
            
            const startTime = startHour * 60 + startMin;
            const endTime = endHour * 60 + endMin;
            
            const isQuiet = startTime < endTime 
              ? currentTime >= startTime && currentTime <= endTime
              : currentTime >= startTime || currentTime <= endTime;
              
            if (!isQuiet) {
              playNotificationSound(latestNotification.type);
            }
          }
        }
      }
    }
  }, [notifications, settings]);

  // Função para testar som (pode ser usada nas configurações)
  const testSound = (type: keyof typeof NOTIFICATION_SOUNDS) => {
    playNotificationSound(type);
  };

  // Expor função de teste globalmente para debug
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).testNotificationSound = testSound;
    }
  }, []);

  // Componente não renderiza nada visualmente
  return null;
};

export default NotificationSound;