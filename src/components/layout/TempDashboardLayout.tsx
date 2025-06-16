'use client'

import React from 'react'

// Layout temporário SIMPLES para testar
export default function TempDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-orange-500 mb-4">CYPHER AI v2 - Modo de Recuperação</h1>
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-4">
          <p className="text-yellow-300">🔧 Sistema em modo de correção - Layout temporário ativo</p>
        </div>
        {children}
      </div>
    </div>
  )
}