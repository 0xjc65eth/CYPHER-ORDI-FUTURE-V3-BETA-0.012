'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Download, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  Filter,
  MoreVertical,
  Star,
  StarOff
} from 'lucide-react'
import { useCollectionData } from '@/hooks/ordinals/useCollectionData'

interface Collection {
  id: string
  name: string
  slug: string
  imageUrl: string
  floorPrice: number
  floorChange24h: number
  volume24h: number
  volumeChange24h: number
  holders: number
  totalSupply: number
  listedCount: number
  listedPercent: number
  verified: boolean
  trending: boolean
  favorite?: boolean
}

export function CollectionsTable() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'volume' | 'floor' | 'holders' | 'listed'>('volume')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterBy, setFilterBy] = useState<'all' | 'verified' | 'trending'>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  
  const { data: collections, isLoading } = useCollectionData()

  // Mock data for demonstration
  const mockCollections: Collection[] = [
    {
      id: '1',
      name: 'NodeMonkes',
      slug: 'nodemonkes',
      imageUrl: '/collections/nodemonkes.png',
      floorPrice: 0.0485,
      floorChange24h: 5.2,
      volume24h: 156.7,
      volumeChange24h: 18.3,
      holders: 1234,
      totalSupply: 10000,
      listedCount: 870,
      listedPercent: 8.7,
      verified: true,
      trending: true
    },
    {
      id: '2',
      name: 'Bitcoin Puppets',
      slug: 'bitcoin-puppets',
      imageUrl: '/collections/bitcoin-puppets.png',
      floorPrice: 0.032,
      floorChange24h: -2.1,
      volume24h: 89.7,
      volumeChange24h: -5.4,
      holders: 987,
      totalSupply: 10000,
      listedCount: 650,
      listedPercent: 6.5,
      verified: true,
      trending: false
    },
    {
      id: '3',
      name: 'Runestones',
      slug: 'runestones',
      imageUrl: '/collections/runestones.png',
      floorPrice: 0.028,
      floorChange24h: 3.8,
      volume24h: 76.2,
      volumeChange24h: 12.5,
      holders: 2345,
      totalSupply: 112383,
      listedCount: 8234,
      listedPercent: 7.3,
      verified: true,
      trending: true
    },
    {
      id: '4',
      name: 'Quantum Cats',
      slug: 'quantum-cats',
      imageUrl: '/collections/quantum-cats.png',
      floorPrice: 0.025,
      floorChange24h: 8.9,
      volume24h: 54.8,
      volumeChange24h: 45.2,
      holders: 543,
      totalSupply: 3333,
      listedCount: 234,
      listedPercent: 7.0,
      verified: false,
      trending: true
    },
    {
      id: '5',
      name: 'Bitcoin Frogs',
      slug: 'bitcoin-frogs',
      imageUrl: '/collections/bitcoin-frogs.png',
      floorPrice: 0.019,
      floorChange24h: -1.2,
      volume24h: 42.1,
      volumeChange24h: 2.3,
      holders: 678,
      totalSupply: 5555,
      listedCount: 456,
      listedPercent: 8.2,
      verified: true,
      trending: false
    }
  ]

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const toggleFavorite = (collectionId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(collectionId)) {
      newFavorites.delete(collectionId)
    } else {
      newFavorites.add(collectionId)
    }
    setFavorites(newFavorites)
  }

  const filteredCollections = mockCollections
    .filter(collection => {
      const matchesSearch = collection.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'verified' && collection.verified) ||
        (filterBy === 'trending' && collection.trending)
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'volume':
          aValue = a.volume24h
          bValue = b.volume24h
          break
        case 'floor':
          aValue = a.floorPrice
          bValue = b.floorPrice
          break
        case 'holders':
          aValue = a.holders
          bValue = b.holders
          break
        case 'listed':
          aValue = a.listedPercent
          bValue = b.listedPercent
          break
      }
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

  const exportToCSV = () => {
    const headers = ['Name', 'Floor Price', '24h Change', 'Volume 24h', 'Holders', 'Listed', 'Verified']
    const rows = filteredCollections.map(c => [
      c.name,
      c.floorPrice,
      c.floorChange24h,
      c.volume24h,
      c.holders,
      c.listedPercent,
      c.verified
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ordinals-collections.csv'
    a.click()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Collections Market Overview</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Collection
                  </Button>
                </th>
                <th className="text-right p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('floor')}
                  >
                    Floor Price
                    {sortBy === 'floor' && (
                      sortOrder === 'desc' ? <ArrowDown className="ml-1 h-3 w-3 inline" /> : <ArrowUp className="ml-1 h-3 w-3 inline" />
                    )}
                  </Button>
                </th>
                <th className="text-right p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('volume')}
                  >
                    Volume 24h
                    {sortBy === 'volume' && (
                      sortOrder === 'desc' ? <ArrowDown className="ml-1 h-3 w-3 inline" /> : <ArrowUp className="ml-1 h-3 w-3 inline" />
                    )}
                  </Button>
                </th>
                <th className="text-right p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('holders')}
                  >
                    Holders
                    {sortBy === 'holders' && (
                      sortOrder === 'desc' ? <ArrowDown className="ml-1 h-3 w-3 inline" /> : <ArrowUp className="ml-1 h-3 w-3 inline" />
                    )}
                  </Button>
                </th>
                <th className="text-right p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('listed')}
                  >
                    Listed
                    {sortBy === 'listed' && (
                      sortOrder === 'desc' ? <ArrowDown className="ml-1 h-3 w-3 inline" /> : <ArrowUp className="ml-1 h-3 w-3 inline" />
                    )}
                  </Button>
                </th>
                <th className="text-center p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.map((collection) => (
                <tr key={collection.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => toggleFavorite(collection.id)}
                      >
                        {favorites.has(collection.id) ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{collection.name}</span>
                          {collection.verified && (
                            <Badge variant="secondary" className="text-xs">Verified</Badge>
                          )}
                          {collection.trending && (
                            <Badge className="text-xs bg-orange-500/20 text-orange-500 border-orange-500/50">
                              Trending
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{collection.totalSupply.toLocaleString()} items</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div>
                      <p className="font-mono font-medium">{collection.floorPrice} BTC</p>
                      <p className={`text-xs flex items-center justify-end gap-1 ${
                        collection.floorChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {collection.floorChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(collection.floorChange24h)}%
                      </p>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div>
                      <p className="font-mono font-medium">{collection.volume24h.toFixed(2)} BTC</p>
                      <p className={`text-xs flex items-center justify-end gap-1 ${
                        collection.volumeChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {collection.volumeChange24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(collection.volumeChange24h)}%
                      </p>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <p className="font-medium">{collection.holders.toLocaleString()}</p>
                  </td>
                  <td className="p-3 text-right">
                    <div>
                      <p className="font-medium">{collection.listedCount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{collection.listedPercent}%</p>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCollections.length} of {mockCollections.length} collections
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}