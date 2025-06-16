/**
 * 🔔 Notification System Activator - CYPHER AI v3.1.0
 * Ativa sistema de notificações e gerencia permissões
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { notificationAudio } from './AudioManager';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Bell, BellOff } from 'lucide-react';
import { devLogger } from '@/lib/logger';

export function NotificationSystemActivator() {
  const { addNotification } = useNotifications();
  const [audioReady, setAudioReady] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState({
    soundEnabled: true,
    showDesktopNotifications: false
  });

  useEffect(() => {
    // Verificar permissão atual de notificações
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Verificar se áudio está pronto
    const checkAudio = () => {
      if (notificationAudio?.isAudioReady()) {
        setAudioReady(true);
      } else {
        setTimeout(checkAudio, 1000);
      }
    };
    checkAudio();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          setSettings(prev => ({ ...prev, showDesktopNotifications: true }));
          addNotification({
            type: 'success',
            title: '✅ Notificações Ativadas',
            message: 'Você receberá alertas importantes do CYPHER AI'
          });
        }
      } catch (error) {
        devLogger.error(error as Error, 'Erro ao solicitar permissão de notificação');
      }
    }
  };

  const testNotifications = () => {
    // Testar som
    if (settings.soundEnabled && audioReady && notificationAudio) {
      notificationAudio.playTradingAlert('high');
    }

    // Testar notificação visual
    addNotification({
      type: 'info',
      title: '🧪 Teste de Notificação',
      message: 'Sistema funcionando perfeitamente!'
    });

    devLogger.log('NOTIFICATIONS', 'Teste de notificações executado');
  };

  const toggleSound = () => {
    const newSoundState = !settings.soundEnabled;
    setSettings(prev => ({ ...prev, soundEnabled: newSoundState }));
    
    if (newSoundState && audioReady && notificationAudio) {
      notificationAudio.playNotificationSound('success');
    }
  };

  const toggleDesktopNotifications = () => {
    if (!settings.showDesktopNotifications && notificationPermission !== 'granted') {
      requestNotificationPermission();
    } else {
      setSettings(prev => ({ ...prev, showDesktopNotifications: !prev.showDesktopNotifications }));
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col gap-2 p-3 bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700">
        <div className="text-xs text-gray-400 font-medium">Notificações CYPHER AI</div>
        
        <div className="flex gap-2">
          {/* Toggle Sound */}
          <Button
            size="sm"
            variant={settings.soundEnabled ? "default" : "outline"}
            onClick={toggleSound}
            disabled={!audioReady}
            className="p-2"
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-4 w-4 text-green-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-gray-400" />
            )}
          </Button>

          {/* Toggle Desktop Notifications */}
          <Button
            size="sm"
            variant={settings.showDesktopNotifications ? "default" : "outline"}
            onClick={toggleDesktopNotifications}
            className="p-2"
          >
            {settings.showDesktopNotifications ? (
              <Bell className="h-4 w-4 text-blue-400" />
            ) : (
              <BellOff className="h-4 w-4 text-gray-400" />
            )}
          </Button>

          {/* Test Button */}
          <Button
            size="sm"
            onClick={testNotifications}
            className="px-3 text-xs bg-orange-600 hover:bg-orange-700"
          >
            Teste
          </Button>
        </div>

        {/* Status indicators */}
        <div className="flex gap-2 text-xs">
          <div className={`flex items-center gap-1 ${audioReady ? 'text-green-400' : 'text-yellow-400'}`}>
            <div className={`w-2 h-2 rounded-full ${audioReady ? 'bg-green-400' : 'bg-yellow-400'}`} />
            Áudio
          </div>
          <div className={`flex items-center gap-1 ${notificationPermission === 'granted' ? 'text-green-400' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${notificationPermission === 'granted' ? 'bg-green-400' : 'bg-gray-400'}`} />
            Push
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationSystemActivator;