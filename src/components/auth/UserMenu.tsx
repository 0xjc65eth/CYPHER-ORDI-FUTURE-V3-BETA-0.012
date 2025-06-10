'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { User, Settings, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
  };

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
      >
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-100">
            {profile?.username || 'User'}
          </p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-sm font-medium text-gray-100">
              {profile?.full_name || profile?.username || 'User'}
            </p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>

          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
          >
            <User className="w-4 h-4" />
            Your Profile
          </Link>

          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>

          <div className="border-t border-gray-700 mt-1 pt-1">
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100 w-full"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}