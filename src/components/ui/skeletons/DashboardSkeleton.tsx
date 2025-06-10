'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DashboardSkeletonProps {
  variant?: 'bloomberg' | 'standard' | 'professional';
  showHeader?: boolean;
  showSidebar?: boolean;
  className?: string;
}

export function DashboardSkeleton({ 
  variant = 'standard', 
  showHeader = true, 
  showSidebar = false,
  className 
}: DashboardSkeletonProps) {
  if (variant === 'bloomberg') {
    return (
      <div className={cn("bg-black min-h-screen", className)}>
        {/* Bloomberg Header Skeleton */}
        {showHeader && (
          <div className="border-b-2 border-orange-500/30">
            <div className="grid grid-cols-12 gap-0">
              <div className="col-span-2 p-3 border-r border-orange-500/30">
                <Skeleton className="h-3 w-24 mb-2 bg-orange-500/20" />
                <Skeleton className="h-6 w-20 bg-orange-500/30" />
              </div>
              <div className="col-span-10 flex items-center">
                <div className="flex-1 grid grid-cols-6 gap-0">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-3 border-r border-orange-500/30">
                      <Skeleton className="h-2 w-16 mb-1 bg-orange-500/20" />
                      <Skeleton className="h-4 w-20 bg-orange-500/30" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Skeleton */}
        <div className="p-4">
          {/* Control Bar Skeleton */}
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-80 bg-orange-500/20" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 bg-orange-500/20" />
              <Skeleton className="h-8 w-8 bg-orange-500/20" />
              <Skeleton className="h-8 w-16 bg-orange-500/20" />
              <Skeleton className="h-4 w-32 bg-orange-500/20" />
            </div>
          </div>

          {/* Market Overview Grid Skeleton */}
          <div className="grid grid-cols-6 gap-2 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-orange-500/30 p-3">
                <Skeleton className="h-2 w-20 mb-2 bg-orange-500/20" />
                <Skeleton className="h-5 w-16 mb-1 bg-orange-500/30" />
                <Skeleton className="h-2 w-12 bg-orange-500/20" />
              </div>
            ))}
          </div>

          {/* Main Dashboard Grid Skeleton */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Panel */}
            <div className="col-span-8 space-y-4">
              {/* CYPHER TRADE Skeleton */}
              <div className="bg-black border border-orange-500/30">
                <div className="border-b border-orange-500/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 bg-orange-500/30" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1 bg-orange-500/30" />
                        <Skeleton className="h-2 w-40 bg-orange-500/20" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-10 bg-green-500/20" />
                      <Skeleton className="h-5 w-16 bg-purple-500/20" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <Skeleton className="h-64 w-full bg-orange-500/10" />
                </div>
              </div>

              {/* Charts Skeleton */}
              <div className="bg-black border border-orange-500/30">
                <div className="border-b border-orange-500/30 p-3">
                  <Skeleton className="h-4 w-48 bg-orange-500/30" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-80 w-full bg-orange-500/10" />
                </div>
              </div>

              {/* Market Data Table Skeleton */}
              <div className="bg-black border border-orange-500/30">
                <div className="border-b border-orange-500/30 p-3">
                  <Skeleton className="h-4 w-48 bg-orange-500/30" />
                </div>
                <div className="p-2">
                  {/* Table Header */}
                  <div className="grid grid-cols-8 gap-0 p-2 border-b border-orange-500/30">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-3 w-12 bg-orange-500/20" />
                    ))}
                  </div>
                  {/* Table Rows */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-8 gap-0 p-2 border-b border-orange-500/10">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-16 bg-orange-500/10" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Network Metrics Grid Skeleton */}
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-black border border-orange-500/30 p-4">
                    <Skeleton className="h-4 w-32 mb-3 bg-orange-500/30" />
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="flex justify-between">
                          <Skeleton className="h-3 w-20 bg-orange-500/20" />
                          <Skeleton className="h-3 w-16 bg-orange-500/20" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - Activity Feed Skeleton */}
            <div className="col-span-4">
              <div className="bg-black border border-orange-500/30 h-full">
                <div className="border-b border-orange-500/30 p-3">
                  <Skeleton className="h-4 w-32 bg-orange-500/30" />
                </div>
                <div className="p-3 space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border-b border-orange-500/10 pb-3">
                      <div className="flex items-start gap-2 mb-2">
                        <Skeleton className="h-4 w-16 bg-green-500/20" />
                        <Skeleton className="h-3 w-12 bg-orange-500/20" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2 bg-orange-500/20" />
                      <Skeleton className="h-3 w-24 mb-2 bg-green-400/20" />
                      <div className="flex justify-between">
                        <Skeleton className="h-2 w-20 bg-orange-500/10" />
                        <Skeleton className="h-2 w-16 bg-orange-500/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="border-t border-orange-500/30 bg-black p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-2 w-16 bg-orange-500/20" />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-2 w-24 bg-orange-500/20" />
              <Skeleton className="h-2 w-20 bg-orange-500/20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Dashboard Skeleton
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {showHeader && (
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {showSidebar && (
          <div className="w-64 border-r bg-card p-4">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 p-6">
          {/* Main Content Grid */}
          <div className="grid gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="border rounded-lg p-4">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>

            {/* Data Table */}
            <div className="border rounded-lg">
              <div className="p-4 border-b">
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="p-4">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 mb-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-20" />
                  ))}
                </div>
                {/* Table Rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-4 mb-3">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <Skeleton key={j} className="h-4 w-24" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;