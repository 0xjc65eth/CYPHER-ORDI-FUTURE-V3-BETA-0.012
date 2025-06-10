/**
 * PWA Update Notification Component
 * Notifica usuário sobre atualizações disponíveis
 */

'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, X, AlertCircle } from 'lucide-react';
import usePWA from '@/hooks/usePWA';

interface PWAUpdateNotificationProps {
  onUpdateApplied?: () => void;
  className?: string;
}

export const PWAUpdateNotification: React.FC<PWAUpdateNotificationProps> = ({
  onUpdateApplied,
  className = ''
}) => {
  const { status, actions } = usePWA();
  const [isApplying, setIsApplying] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { isUpdateAvailable, updatePending } = status.updateInfo;

  // Reset dismissed state quando nova atualização estiver disponível
  useEffect(() => {
    if (isUpdateAvailable && updatePending) {
      setDismissed(false);
    }
  }, [isUpdateAvailable, updatePending]);

  const handleApplyUpdate = async () => {
    setIsApplying(true);
    
    try {
      await actions.applyUpdate();
      onUpdateApplied?.();
    } catch (error) {
      console.error('[PWA] Erro ao aplicar atualização:', error);
      setIsApplying(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Não mostrar se não há atualização ou foi dispensado
  if (!isUpdateAvailable || !updatePending || dismissed) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slide-in-from-top ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-2xl shadow-2xl border border-blue-400/30 backdrop-blur-lg max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-xl mr-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Atualização disponível</h3>
              <p className="text-blue-100 text-sm">Nova versão do CYPHER ORDI</p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center text-sm text-blue-100 mb-2">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>Melhorias e correções incluídas</span>
          </div>
          <ul className="text-sm text-blue-100 space-y-1 ml-6">
            <li>• Performance otimizada</li>
            <li>• Novos recursos</li>
            <li>• Correções de bugs</li>
          </ul>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            className="flex-1 bg-blue-500/30 text-white py-2 px-3 rounded-xl text-sm font-medium transition-colors hover:bg-blue-500/50"
          >
            Mais tarde
          </button>
          <button
            onClick={handleApplyUpdate}
            disabled={isApplying}
            className="flex-2 bg-white text-blue-600 py-2 px-4 rounded-xl text-sm font-bold transition-all hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Atualizando...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" />
                Atualizar agora
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de status offline/online
 */
export const PWAConnectionStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in-from-bottom ${className}`}>
      <div className={`px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg ${
        isOnline 
          ? 'bg-green-500' 
          : 'bg-red-500'
      }`}>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isOnline ? 'bg-green-200' : 'bg-red-200'
          }`} />
          {isOnline ? 'Conectado' : 'Sem conexão'}
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;
