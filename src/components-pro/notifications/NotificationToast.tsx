'use client';

import React, { useState, useEffect } from 'react';
import * as Toast from '@radix-ui/react-toast';
import { useAppDispatch } from '@/store';
import { markAsRead, removeNotification } from '@/store/notificationSlice';
import { Notification, NotificationType } from '@/types/notifications';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Newspaper,
  Settings,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationToastProps {
  notification: Notification;
}

// Função para obter ícone baseado no tipo
const getNotificationIcon = (type: NotificationType) => {
  const iconProps = { className: "h-5 w-5" };
  
  switch (type) {
    case 'price_alert':
      return <DollarSign {...iconProps} />;
    case 'arbitrage_opportunity':
      return <TrendingUp {...iconProps} />;
    case 'trading_signal':
      return <BarChart3 {...iconProps} />;
    case 'portfolio_update':
      return <BarChart3 {...iconProps} />;
    case 'news':
      return <Newspaper {...iconProps} />;
    case 'system':
      return <Settings {...iconProps} />;
    case 'error':
      return <AlertCircle {...iconProps} />;
    case 'success':
      return <CheckCircle {...iconProps} />;
    case 'warning':
      return <AlertTriangle {...iconProps} />;
    case 'info':
    default:
      return <Info {...iconProps} />;
  }
};

// Função para obter cores baseadas no tipo
const getNotificationColors = (type: NotificationType) => {
  switch (type) {
    case 'price_alert':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-100'
      };
    case 'arbitrage_opportunity':
      return {
        bg: 'bg-green-50 dark:bg-green-950',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        title: 'text-green-900 dark:text-green-100'
      };
    case 'trading_signal':
      return {
        bg: 'bg-purple-50 dark:bg-purple-950',
        border: 'border-purple-200 dark:border-purple-800',
        icon: 'text-purple-600 dark:text-purple-400',
        title: 'text-purple-900 dark:text-purple-100'
      };
    case 'portfolio_update':
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950',
        border: 'border-indigo-200 dark:border-indigo-800',
        icon: 'text-indigo-600 dark:text-indigo-400',
        title: 'text-indigo-900 dark:text-indigo-100'
      };
    case 'news':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950',
        border: 'border-amber-200 dark:border-amber-800',
        icon: 'text-amber-600 dark:text-amber-400',
        title: 'text-amber-900 dark:text-amber-100'
      };
    case 'error':
      return {
        bg: 'bg-red-50 dark:bg-red-950',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-900 dark:text-red-100'
      };
    case 'success':
      return {
        bg: 'bg-green-50 dark:bg-green-950',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        title: 'text-green-900 dark:text-green-100'
      };
    case 'warning':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'text-orange-600 dark:text-orange-400',
        title: 'text-orange-900 dark:text-orange-100'
      };
    case 'system':
    case 'info':
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-950',
        border: 'border-gray-200 dark:border-gray-800',
        icon: 'text-gray-600 dark:text-gray-400',
        title: 'text-gray-900 dark:text-gray-100'
      };
  }
};

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(true);
  const colors = getNotificationColors(notification.type);
  const icon = getNotificationIcon(notification.type);

  // Auto-fechar para notificações não persistentes
  useEffect(() => {
    if (!notification.persistent) {
      const duration = notification.priority === 'critical' ? 10000 : 5000;
      const timer = setTimeout(() => {
        setOpen(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification.persistent, notification.priority]);

  // Marcar como lida quando o toast for fechado
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && !notification.read) {
      dispatch(markAsRead(notification.id));
    }
  };

  // Fechar e remover notificação
  const handleDismiss = () => {
    setOpen(false);
    setTimeout(() => {
      dispatch(removeNotification(notification.id));
    }, 150); // Delay para animação
  };

  // Executar ação
  const handleAction = (action: () => void) => {
    action();
    handleDismiss();
  };

  // Formatar timestamp
  const timeAgo = () => {
    const now = Date.now();
    const diff = now - notification.timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'agora';
  };

  return (
    <Toast.Root
      className={`
        ${colors.bg} ${colors.border}
        border rounded-lg shadow-lg p-4 grid
        [grid-template-areas:_'title_action'_'description_action']
        grid-cols-[auto_max-content] gap-x-4 gap-y-1
        items-center transform transition-all duration-200
        data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full
        data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full
        data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]
        data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out]
        data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full
        min-w-[350px] max-w-[420px]
      `}
      open={open}
      onOpenChange={handleOpenChange}
    >
      {/* Cabeçalho com título e ícone */}
      <div className="flex items-center gap-3 [grid-area:_title]">
        <div className={`${colors.icon} flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <Toast.Title className={`${colors.title} font-semibold text-sm leading-5 truncate`}>
            {notification.title}
          </Toast.Title>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {timeAgo()}
            </span>
            {notification.priority === 'critical' && (
              <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded">
                Crítico
              </span>
            )}
            {notification.priority === 'high' && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-1.5 py-0.5 rounded">
                Alto
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botão de fechar */}
      <Toast.Close asChild>
        <Button
          variant="ghost"
          size="sm"
          className="[grid-area:_action] h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </Toast.Close>

      {/* Descrição */}
      <Toast.Description className="[grid-area:_description] text-sm text-gray-700 dark:text-gray-300 leading-5 mt-1">
        {notification.message}
      </Toast.Description>

      {/* Ações personalizadas */}
      {notification.actions && notification.actions.length > 0 && (
        <div className="[grid-area:_description] mt-3 flex gap-2">
          {notification.actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "default"}
              size="sm"
              className="text-xs h-7"
              onClick={() => handleAction(action.action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Metadata específica */}
      {notification.type === 'price_alert' && notification.metadata && (
        <div className="[grid-area:_description] mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <div className="flex justify-between">
            <span>Símbolo: {notification.metadata.symbol}</span>
            <span className={notification.metadata.percentage > 0 ? 'text-green-600' : 'text-red-600'}>
              {notification.metadata.percentage > 0 ? '+' : ''}{notification.metadata.percentage.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {notification.type === 'arbitrage_opportunity' && notification.metadata && (
        <div className="[grid-area:_description] mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <div className="flex justify-between">
            <span>Exchanges: {notification.metadata.exchanges.join(', ')}</span>
            <span className="text-green-600 font-medium">
              Lucro: ${notification.metadata.potential_profit?.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </Toast.Root>
  );
};

export default NotificationToast;