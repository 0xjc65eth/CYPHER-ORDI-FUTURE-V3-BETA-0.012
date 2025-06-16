'use client';

import React from 'react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">CYPHER ORDI Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Bitcoin Price</h2>
            <p className="text-gray-400">Loading...</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Market Status</h2>
            <p className="text-gray-400">Loading...</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Trading</h2>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500">CYPHER ORDI FUTURE V3.0.0 - Simplified Dashboard</p>
        </div>
      </div>
    </div>
  );
}