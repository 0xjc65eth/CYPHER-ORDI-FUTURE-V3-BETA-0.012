'use client'

import Link from 'next/link'
import { TopNavLayout } from '@/components/layout/TopNavLayout'

export default function NavTestPage() {
  const testNavigation = (href: string, method: string) => {
    console.log(`🧪 Testing ${method} navigation to:`, href);
    
    if (method === 'window.location') {
      window.location.href = href;
    } else if (method === 'history.pushState') {
      window.history.pushState({}, '', href);
      window.location.reload();
    }
  };

  return (
    <TopNavLayout>
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">🔧 Navigation Test Page</h1>
          <p className="text-gray-400">Testing different navigation methods</p>
        </div>

        {/* Test Standard Next.js Links */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">📍 Standard Next.js Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center transition-colors">
              Dashboard
            </Link>
            <Link href="/cypher-ai" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-center transition-colors">
              CYPHER AI  
            </Link>
            <Link href="/market" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center transition-colors">
              Market
            </Link>
            <Link href="/arbitrage" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-center transition-colors">
              Arbitrage
            </Link>
          </div>
        </div>

        {/* Test Button Navigation */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">🔘 Button Navigation (window.location)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => testNavigation('/', 'window.location')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => testNavigation('/cypher-ai', 'window.location')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              CYPHER AI
            </button>
            <button 
              onClick={() => testNavigation('/market', 'window.location')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Market
            </button>
            <button 
              onClick={() => testNavigation('/arbitrage', 'window.location')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Arbitrage
            </button>
          </div>
        </div>

        {/* Test Navigation Info */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">🔍 Current Navigation Info</h2>
          <div className="space-y-2 font-mono text-sm">
            <p className="text-gray-300">Current URL: <span className="text-green-400">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</span></p>
            <p className="text-gray-300">Pathname: <span className="text-blue-400">{typeof window !== 'undefined' ? window.location.pathname : 'Loading...'}</span></p>
            <p className="text-gray-300">User Agent: <span className="text-yellow-400">{typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 50) + '...' : 'Loading...'}</span></p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">📋 Test Instructions</h2>
          <ol className="space-y-2 text-gray-300">
            <li>1. Open browser console (F12)</li>
            <li>2. Try clicking the "Standard Next.js Links" above</li>
            <li>3. Try clicking the "Button Navigation" links</li>
            <li>4. Check console for debug messages</li>
            <li>5. Compare which method works vs doesn't work</li>
            <li>6. Test the main navigation tabs at the top of the page</li>
          </ol>
        </div>
      </div>
    </TopNavLayout>
  )
}