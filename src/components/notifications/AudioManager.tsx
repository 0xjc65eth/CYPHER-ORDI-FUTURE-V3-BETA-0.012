'use client';

import { useEffect, useRef, useCallback } from 'react';
import { devLogger } from '@/lib/logger';

export interface AudioManagerProps {
  onAudioReady?: () => void;
}

export class NotificationAudio {
  private audioContext: AudioContext | null = null;
  private isReady = false;
  private userInteracted = false;

  constructor() {
    // Only setup listeners in browser environment
    if (typeof window !== 'undefined') {
      this.setupUserInteractionListener();
    }
  }

  private setupUserInteractionListener() {
    const handleFirstInteraction = () => {
      this.userInteracted = true;
      this.initializeAudioContext();
      
      // Remover listeners após primeira interação
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isReady = true;
      devLogger.log('AUDIO', 'AudioContext inicializado após user interaction');
    } catch (error) {
      devLogger.error(error as Error, 'Falha ao inicializar AudioContext');
    }
  }

  public playNotificationSound(type: 'success' | 'warning' | 'error' | 'info' = 'info') {
    if (!this.isReady || !this.audioContext) {
      devLogger.log('AUDIO', 'AudioContext não pronto - silenciando notificação');
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Diferentes frequências para diferentes tipos
      const frequencies = {
        success: 800,
        warning: 600,
        error: 400,
        info: 700
      };

      const duration = type === 'error' ? 0.5 : 0.2;

      oscillator.frequency.value = frequencies[type];
      oscillator.type = 'sine';
      
      // Envelope de volume para evitar clicks
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      devLogger.error(error as Error, 'Erro ao reproduzir som de notificação');
    }
  }

  public playTradingAlert(priority: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    if (!this.isReady || !this.audioContext) return;

    const patterns = {
      low: [500],
      medium: [600, 0.1, 600],
      high: [800, 0.1, 800, 0.1, 800],
      critical: [1000, 0.05, 900, 0.05, 1000, 0.05, 900, 0.05, 1000]
    };

    const pattern = patterns[priority];
    let time = this.audioContext.currentTime;

    for (let i = 0; i < pattern.length; i++) {
      if (typeof pattern[i] === 'number' && pattern[i] > 100) {
        // É uma frequência
        const freq = pattern[i] as number;
        this.playToneAt(freq, time, 0.1);
        time += 0.1;
      } else {
        // É um delay
        time += pattern[i] as number;
      }
    }
  }

  private playToneAt(frequency: number, startTime: number, duration: number) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  public isAudioReady(): boolean {
    return this.isReady && this.userInteracted;
  }
}

// Singleton instance with lazy initialization
let _notificationAudio: NotificationAudio | null = null;

export function getNotificationAudio(): NotificationAudio {
  if (typeof window === 'undefined') {
    // Return a mock object for SSR
    return {
      playNotificationSound: () => {},
      isAudioReady: () => false,
    } as NotificationAudio;
  }
  
  if (!_notificationAudio) {
    _notificationAudio = new NotificationAudio();
  }
  return _notificationAudio;
}

// For backward compatibility
export const notificationAudio = typeof window !== 'undefined' ? getNotificationAudio() : null;

// React component para inicializar o sistema
export function AudioManager({ onAudioReady }: AudioManagerProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      
      const audio = getNotificationAudio();
      
      // Verificar periodicamente se o áudio está pronto
      const checkAudioReady = () => {
        if (audio.isAudioReady()) {
          onAudioReady?.();
          return;
        }
        setTimeout(checkAudioReady, 1000);
      };
      
      checkAudioReady();
    }
  }, [onAudioReady]);

  return null; // Componente invisível
}

export default AudioManager;
