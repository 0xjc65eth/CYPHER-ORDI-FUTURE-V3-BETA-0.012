'use client'

import React from 'react'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto my-8">
      <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
      <div className="bg-white p-4 rounded border border-red-100 mb-4">
        <p className="text-red-600 font-mono text-sm overflow-auto">{error.message}</p>
      </div>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
