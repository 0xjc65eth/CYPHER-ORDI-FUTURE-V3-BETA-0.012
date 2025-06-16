'use client';

import React, { useEffect, useState } from 'react';

interface NoSSRWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * NoSSRWrapper - Prevents hydration errors by only rendering children on client-side
 * Use this for components that have client-side only dependencies (charts, dynamic content, etc.)
 */
export function NoSSRWrapper({ children, fallback = null }: NoSSRWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="animate-pulse">
        {fallback || (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="h-4 bg-gray-700/60 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700/60 rounded w-1/2 mb-2"></div>
            <div className="h-32 bg-gray-700/60 rounded"></div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}