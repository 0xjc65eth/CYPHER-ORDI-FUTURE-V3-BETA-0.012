'use client';

import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import * as Select from '@radix-ui/react-select';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectNotifications,
  selectUnreadCount,
  selectNotificationSettings,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  bulkMarkAsRead,
  bulkRemoveNotifications,
  updateSettings
} from '@/store/notificationSlice';
import { 
  NotificationType, 
  NotificationPriority, 
  Notification,
  NotificationFilter
} from '@/types/notifications';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  ChevronDown,
  Search,
  DollarSign,
  TrendingUp,
  BarChart3,
  Newspaper,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationCenterProps {
  trigger?: React.ReactNode;
}

// Componente para item individual de notificação
const NotificationItem: React.FC<{
  notification: Notification;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}> = ({ notification, isSelected, onSelect, onMarkAsRead, onRemove }) => {
  const getIcon = () => {
    const iconProps = { className: "h-4 w-4" };
    switch (notification.type) {
      case 'price_alert': return <DollarSign {...iconProps} />;
      case 'arbitrage_opportunity': return <TrendingUp {...iconProps} />;
      case 'trading_signal': return <BarChart3 {...iconProps} />;
      case 'portfolio_update': return <BarChart3 {...iconProps} />;
      case 'news': return <Newspaper {...iconProps} />;
      case 'error': return <AlertCircle {...iconProps} />;
      case 'success': return <CheckCircle {...iconProps} />;
      case 'warning': return <AlertTriangle {...iconProps} />;
      default: return <Info {...iconProps} />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-blue-500';
      case 'low': return 'border-l-gray-500';
    }
  };

  const timeAgo = () => {
    const now = Date.now();
    const diff = now - notification.timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}m atrás`;
    return 'agora';
  };

  return (
    <div
      className={`
        p-3 border-l-4 ${getPriorityColor()} 
        ${notification.read ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer
      `}
      onClick={() => onSelect(notification.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(notification.id)}
            className="mt-1 rounded"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="text-gray-600 dark:text-gray-400 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`text-sm font-medium truncate ${
                notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'
              }`}>
                {notification.title}
              </h4>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
              {notification.message}
            </p>
            
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-gray-500">
                {timeAgo()}
              </span>
              
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                {notification.type.replace('_', ' ')}
              </span>
              
              {notification.persistent && (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Persistente
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              title="Marcar como lida"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(notification.id);
            }}
            title="Remover"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  trigger 
}) => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const settings = useAppSelector(selectNotificationSettings);
  
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [filter, setFilter] = useState<NotificationFilter>({});

  // Filtrar e buscar notificações
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filtro por aba
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }

    // Filtro por tipo
    if (filter.type && filter.type.length > 0) {
      filtered = filtered.filter(n => filter.type!.includes(n.type));
    }

    // Filtro por prioridade
    if (filter.priority && filter.priority.length > 0) {
      filtered = filtered.filter(n => filter.priority!.includes(n.priority));
    }

    // Busca por texto
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, activeTab, filter, searchQuery]);

  // Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = () => {
    if (selectedIds.length > 0) {
      dispatch(bulkMarkAsRead(selectedIds));
      setSelectedIds([]);
    }
  };

  const handleBulkRemove = () => {
    if (selectedIds.length > 0) {
      dispatch(bulkRemoveNotifications(selectedIds));
      setSelectedIds([]);
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
    setSelectedIds([]);
  };

  // Trigger padrão
  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || defaultTrigger}
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-2xl h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" />
              <Dialog.Title className="text-lg font-semibold">
                Central de Notificações
              </Dialog.Title>
              {unreadCount > 0 && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                  {unreadCount} não lidas
                </span>
              )}
            </div>
            
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <Tabs.Root value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex flex-col h-full">
            
            {/* Tabs Navigation */}
            <Tabs.List className="flex border-b dark:border-gray-700 px-4">
              <Tabs.Trigger 
                value="all" 
                className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
              >
                Todas ({notifications.length})
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="unread"
                className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
              >
                Não lidas ({unreadCount})
              </Tabs.Trigger>
              <Tabs.Trigger 
                value="settings"
                className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
              >
                <Settings className="h-4 w-4" />
              </Tabs.Trigger>
            </Tabs.List>

            {/* Notifications Tab */}
            <Tabs.Content value="all" className="flex-1 flex flex-col overflow-hidden">
              
              {/* Controls */}
              <div className="p-4 border-b dark:border-gray-700 space-y-3">
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar notificações..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                  />
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedIds.length > 0 ? `${selectedIds.length} selecionadas` : 'Selecionar todas'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                      <>
                        <Button variant="outline" size="sm" onClick={handleBulkMarkAsRead}>
                          <Check className="h-4 w-4 mr-1" />
                          Marcar como lidas
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleBulkRemove}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </>
                    )}
                    
                    <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                      <CheckCheck className="h-4 w-4 mr-1" />
                      Todas lidas
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={handleClearAll}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Limpar todas
                    </Button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <Bell className="h-12 w-12 mb-2" />
                    <p>Nenhuma notificação encontrada</p>
                  </div>
                ) : (
                  <div className="divide-y dark:divide-gray-700">
                    {filteredNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        isSelected={selectedIds.includes(notification.id)}
                        onSelect={(id) => {
                          setSelectedIds(prev => 
                            prev.includes(id) 
                              ? prev.filter(i => i !== id)
                              : [...prev, id]
                          );
                        }}
                        onMarkAsRead={(id) => dispatch(markAsRead(id))}
                        onRemove={(id) => dispatch(removeNotification(id))}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Tabs.Content>

            {/* Unread Tab */}
            <Tabs.Content value="unread" className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <CheckCircle className="h-12 w-12 mb-2" />
                    <p>Todas as notificações foram lidas!</p>
                  </div>
                ) : (
                  <div className="divide-y dark:divide-gray-700">
                    {filteredNotifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        isSelected={selectedIds.includes(notification.id)}
                        onSelect={(id) => {
                          setSelectedIds(prev => 
                            prev.includes(id) 
                              ? prev.filter(i => i !== id)
                              : [...prev, id]
                          );
                        }}
                        onMarkAsRead={(id) => dispatch(markAsRead(id))}
                        onRemove={(id) => dispatch(removeNotification(id))}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Tabs.Content>

            {/* Settings Tab */}
            <Tabs.Content value="settings" className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Configurações de Notificação</h3>
                  
                  {/* Configurações globais */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Notificações habilitadas</label>
                        <p className="text-xs text-gray-500">Ativar/desativar todas as notificações</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) => dispatch(updateSettings({ enabled: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Notificações do browser</label>
                        <p className="text-xs text-gray-500">Mostrar notificações do sistema</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.browserNotifications}
                        onChange={(e) => dispatch(updateSettings({ browserNotifications: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Som</label>
                        <p className="text-xs text-gray-500">Reproduzir som nas notificações</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.sound}
                        onChange={(e) => dispatch(updateSettings({ sound: e.target.checked }))}
                        className="rounded"
                      />
                    </div>
                  </div>
                  
                  {/* Configurações por tipo */}
                  <div className="mt-6">
                    <h4 className="text-md font-medium mb-3">Tipos de Notificação</h4>
                    <div className="space-y-3">
                      {Object.entries(settings.types).map(([type, typeSettings]) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <div>
                            <label className="text-sm font-medium capitalize">
                              {type.replace('_', ' ')}
                            </label>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-xs">Som</label>
                            <input
                              type="checkbox"
                              checked={typeSettings.sound}
                              onChange={(e) => dispatch(updateSettings({
                                types: {
                                  ...settings.types,
                                  [type]: { ...typeSettings, sound: e.target.checked }
                                }
                              }))}
                              className="rounded"
                            />
                            <label className="text-xs">Browser</label>
                            <input
                              type="checkbox"
                              checked={typeSettings.browser}
                              onChange={(e) => dispatch(updateSettings({
                                types: {
                                  ...settings.types,
                                  [type]: { ...typeSettings, browser: e.target.checked }
                                }
                              }))}
                              className="rounded"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NotificationCenter;