// Exports principais do sistema de notificações
export { NotificationSystem, useNotifications, NotificationTemplates } from './NotificationSystem';
export { NotificationCenter } from './NotificationCenter';
export { NotificationToast } from './NotificationToast';
export { ToastProvider } from './ToastProvider';
export { NotificationSound } from './NotificationSound';
export { NotificationDemo } from './NotificationDemo';

// Re-exports de serviços e utilitários
export { notificationService, notify } from '@/services/notification-service';
export { notificationPersistence } from '@/lib/notification-persistence';

// Re-exports de tipos
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationState,
  NotificationSettings,
  CreateNotificationConfig,
  UseNotificationsReturn
} from '@/types/notifications';

// Re-exports de store
export {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  updateSettings,
  selectNotifications,
  selectUnreadCount,
  selectNotificationSettings
} from '@/store/notificationSlice';