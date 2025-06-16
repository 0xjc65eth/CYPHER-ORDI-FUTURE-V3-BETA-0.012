'use client'

import React from 'react'

interface DashboardCardProps {
  title: string
  children: React.ReactNode
}

export function DashboardCard({ title, children }: DashboardCardProps) {
  return (
    <div className="bg-[#1E293B] rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-medium text-white mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  )
}
