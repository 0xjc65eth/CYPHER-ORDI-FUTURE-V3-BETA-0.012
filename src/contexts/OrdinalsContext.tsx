'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface OrdinalsContextType {
  selectedCollection: string
  setSelectedCollection: (collection: string) => void
  selectedTimeRange: string
  setSelectedTimeRange: (timeRange: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const OrdinalsContext = createContext<OrdinalsContextType | undefined>(undefined)

interface OrdinalsProviderProps {
  children: ReactNode
}

export function OrdinalsProvider({ children }: OrdinalsProviderProps) {
  const [selectedCollection, setSelectedCollection] = useState('nodemonkes')
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [searchQuery, setSearchQuery] = useState('')

  const value = {
    selectedCollection,
    setSelectedCollection,
    selectedTimeRange,
    setSelectedTimeRange,
    searchQuery,
    setSearchQuery
  }

  return (
    <OrdinalsContext.Provider value={value}>
      {children}
    </OrdinalsContext.Provider>
  )
}

export function useOrdinals() {
  const context = useContext(OrdinalsContext)
  if (context === undefined) {
    throw new Error('useOrdinals must be used within an OrdinalsProvider')
  }
  return context
}