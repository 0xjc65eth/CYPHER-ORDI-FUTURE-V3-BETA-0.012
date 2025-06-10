'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  CreditCard, 
  ArrowUpDown, 
  Wallet, 
  Settings,
  LogOut,
  TrendingUp,
  BarChart3,
  Bot
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/trading', label: 'Trading', icon: TrendingUp },
  { href: '/cypher-ai', label: 'CYPHER AI', icon: Bot },
  { href: '/transactions', label: 'Transactions', icon: ArrowUpDown },
  { href: '/cards', label: 'Cards', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-orange-500">CYPHER</h1>
        <p className="text-xs text-gray-400 mt-1">Bitcoin Analytics</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}