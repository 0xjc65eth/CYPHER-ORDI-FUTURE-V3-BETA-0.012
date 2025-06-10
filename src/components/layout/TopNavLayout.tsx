'use client'

import React from 'react'

interface TopNavLayoutProps {
  children: React.ReactNode
}

export function TopNavLayout({ children }: TopNavLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Content area with margin-top to avoid covering sticky navigation */}
      <main className="mt-16 px-4 py-6">
        {children}
      </main>
    </div>
  )
}