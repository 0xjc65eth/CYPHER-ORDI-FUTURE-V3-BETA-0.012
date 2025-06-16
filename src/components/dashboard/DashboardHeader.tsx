'use client';

import { Bell, Search, Menu, User } from 'lucide-react';

interface DashboardHeaderProps {
  user?: {
    email?: string;
    id?: string;
  } | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search addresses, transactions..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
            />
          </div>
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.email || 'Guest User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.id ? `ID: ${user.id.slice(0, 8)}...` : 'Not authenticated'}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              {user?.email ? (
                <span className="text-sm font-medium text-white">
                  {user.email[0].toUpperCase()}
                </span>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}