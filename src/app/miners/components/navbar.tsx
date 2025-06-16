'use client'

import React from 'react'

export function Navbar() {
  return (
    <nav className="bg-[#1E293B] py-3">
      <div className="container mx-auto px-4">
        <ul className="flex space-x-6 overflow-x-auto pb-2">
          <li>
            <a 
              href="/" 
              className="text-gray-300 hover:text-white whitespace-nowrap"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a 
              href="/miners" 
              className="text-blue-400 border-b-2 border-blue-400 pb-1 whitespace-nowrap"
            >
              Miners
            </a>
          </li>
          <li>
            <a 
              href="/network" 
              className="text-gray-300 hover:text-white whitespace-nowrap"
            >
              Network
            </a>
          </li>
          <li>
            <a 
              href="/ordinals" 
              className="text-gray-300 hover:text-white whitespace-nowrap"
            >
              Ordinals
            </a>
          </li>
          <li>
            <a 
              href="/runes" 
              className="text-gray-300 hover:text-white whitespace-nowrap"
            >
              Runes
            </a>
          </li>
          <li>
            <a 
              href="/trading" 
              className="text-gray-300 hover:text-white whitespace-nowrap"
            >
              Trading
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
