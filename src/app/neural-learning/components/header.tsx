'use client'

import React from 'react'

export function Header() {
  return (
    <header className="bg-[#0F172A] border-b border-gray-800 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white">Bitcoin Analytics</h1>
        </div>
        <nav className="hidden md:flex space-x-6">
          <a href="/" className="text-gray-300 hover:text-white">Dashboard</a>
          <a href="/neural-learning" className="text-gray-300 hover:text-white">Neural Learning</a>
          <a href="/ordinals" className="text-gray-300 hover:text-white">Ordinals</a>
        </nav>
      </div>
    </header>
  )
}
