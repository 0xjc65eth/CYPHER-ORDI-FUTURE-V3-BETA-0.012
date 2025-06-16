/**
 * 🔔 Notifications Panel Component
 * Displays system notifications
 */

'use client';

import React from 'react';
import { Bell, X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Trade Executed',
      message: 'BTC buy order completed successfully',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'info',
      title: 'AI Analysis Complete',
      message: 'Market analysis updated with new signals',
      timestamp: new Date()
    }
  ]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </h3>
        <span className="text-sm text-gray-400">{notifications.length} new</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No new notifications</p>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className="bg-gray-900/50 rounded-lg p-4 flex items-start space-x-3"
            >
              {getIcon(notification.type)}
              <div className="flex-1">
                <h4 className="text-white font-medium">{notification.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
