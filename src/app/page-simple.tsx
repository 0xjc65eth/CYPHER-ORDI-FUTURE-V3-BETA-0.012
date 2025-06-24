'use client';

import React from 'react';

export default function SimpleDashboard() {
  return (
    <div className="min-h-screen bg-black text-orange-500 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🚀 CYPHER ORDi Future V3</h1>
          <p className="text-orange-300">Bloomberg Terminal Style Dashboard - Beta 0.012</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Status Card */}
          <div className="bg-gray-900 border border-orange-500 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">✅ Sistema Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Servidor:</span>
                <span className="text-green-500">Online</span>
              </div>
              <div className="flex justify-between">
                <span>Next.js:</span>
                <span className="text-green-500">15.3.3</span>
              </div>
              <div className="flex justify-between">
                <span>Node.js:</span>
                <span className="text-green-500">18.20.5</span>
              </div>
            </div>
          </div>

          {/* Bitcoin Card */}
          <div className="bg-gray-900 border border-orange-500 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">₿ Bitcoin</h2>
            <div className="space-y-2">
              <div className="text-2xl font-bold">$43,250</div>
              <div className="text-green-500">+2.4% (24h)</div>
              <div className="text-sm text-gray-400">Market Cap: $847B</div>
            </div>
          </div>

          {/* Features Card */}
          <div className="bg-gray-900 border border-orange-500 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🔧 Recursos</h2>
            <div className="space-y-2 text-sm">
              <div>✅ Portfolio Management</div>
              <div>✅ CYPHER AI Analytics</div>
              <div>✅ Real-time Data</div>
              <div>✅ Wallet Integration</div>
              <div>✅ Bloomberg Terminal UI</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="bg-gray-900 border border-orange-500 rounded-lg p-6 col-span-full">
            <h2 className="text-xl font-semibold mb-4">📍 Navegação</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/dashboard" className="block p-3 bg-orange-900/20 rounded hover:bg-orange-900/40 transition-colors">
                <div className="font-semibold">Dashboard</div>
                <div className="text-sm text-gray-400">Main Interface</div>
              </a>
              <a href="/portfolio" className="block p-3 bg-orange-900/20 rounded hover:bg-orange-900/40 transition-colors">
                <div className="font-semibold">Portfolio</div>
                <div className="text-sm text-gray-400">Asset Management</div>
              </a>
              <a href="/cypher-ai" className="block p-3 bg-orange-900/20 rounded hover:bg-orange-900/40 transition-colors">
                <div className="font-semibold">CYPHER AI</div>
                <div className="text-sm text-gray-400">AI Analytics</div>
              </a>
              <a href="/ordinals" className="block p-3 bg-orange-900/20 rounded hover:bg-orange-900/40 transition-colors">
                <div className="font-semibold">Ordinals</div>
                <div className="text-sm text-gray-400">Bitcoin NFTs</div>
              </a>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-500">
          <p>CYPHER ORDi Future V3 - Beta 0.012 | Commit: 4038c8cf</p>
          <p>Servidor funcionando em http://localhost:4444</p>
        </footer>
      </div>
    </div>
  );
}