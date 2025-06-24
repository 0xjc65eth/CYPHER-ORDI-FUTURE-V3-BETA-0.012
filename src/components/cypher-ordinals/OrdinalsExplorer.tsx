'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Hash, 
  ExternalLink,
  Eye,
  Download,
  Share,
  Star,
  Image as ImageIcon,
  FileText,
  Music,
  Video,
  Code,
  Archive
} from 'lucide-react'

interface OrdinalsExplorerProps {
  searchQuery: string
}

interface Ordinal {
  id: string
  number: number
  address: string
  contentType: string
  contentUrl: string
  size: number
  timestamp: number
  owner: string
  collection?: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  rarityScore: number
  inscription_fee: number
  genesis_height: number
  sat_rarity: string
  attributes?: Array<{ trait_type: string; value: string; rarity: number }>
}

export function OrdinalsExplorer({ searchQuery }: OrdinalsExplorerProps) {
  const [ordinals, setOrdinals] = useState<Ordinal[]>([])
  const [filteredOrdinals, setFilteredOrdinals] = useState<Ordinal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrdinal, setSelectedOrdinal] = useState<Ordinal | null>(null)
  const [filters, setFilters] = useState({
    contentType: 'all',
    rarity: 'all',
    collection: 'all',
    sortBy: 'number'
  })

  // Mock data para demonstração
  useEffect(() => {
    const mockOrdinals: Ordinal[] = [
      {
        id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        number: 65123456,
        address: 'bc1q...abc123',
        contentType: 'image/png',
        contentUrl: '/api/placeholder/ordinal1.png',
        size: 24576,
        timestamp: Date.now() - 3600000,
        owner: 'bc1q...def456',
        collection: 'NodeMonkes',
        rarity: 'rare',
        rarityScore: 89.5,
        inscription_fee: 25000,
        genesis_height: 834567,
        sat_rarity: 'uncommon',
        attributes: [
          { trait_type: 'Background', value: 'Blue', rarity: 15.2 },
          { trait_type: 'Body', value: 'Robot', rarity: 8.7 },
          { trait_type: 'Hat', value: 'Crown', rarity: 2.3 }
        ]
      },
      {
        id: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1',
        number: 65123457,
        address: 'bc1q...xyz789',
        contentType: 'text/plain',
        contentUrl: '',
        size: 1024,
        timestamp: Date.now() - 7200000,
        owner: 'bc1q...ghi012',
        rarity: 'common',
        rarityScore: 45.2,
        inscription_fee: 15000,
        genesis_height: 834568,
        sat_rarity: 'common'
      },
      {
        id: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2',
        number: 65123458,
        address: 'bc1q...uvw345',
        contentType: 'application/json',
        contentUrl: '',
        size: 2048,
        timestamp: Date.now() - 10800000,
        owner: 'bc1q...jkl678',
        collection: 'Bitcoin Puppets',
        rarity: 'legendary',
        rarityScore: 99.8,
        inscription_fee: 45000,
        genesis_height: 834569,
        sat_rarity: 'rare',
        attributes: [
          { trait_type: 'Type', value: 'Golden', rarity: 0.1 },
          { trait_type: 'Eyes', value: 'Laser', rarity: 0.5 }
        ]
      }
    ]

    setTimeout(() => {
      setOrdinals(mockOrdinals)
      setFilteredOrdinals(mockOrdinals)
      setIsLoading(false)
    }, 1500)
  }, [])

  // Filtrar ordinals baseado na pesquisa e filtros
  useEffect(() => {
    let filtered = ordinals

    // Filtro de pesquisa
    if (searchQuery) {
      filtered = filtered.filter(ordinal => 
        ordinal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ordinal.number.toString().includes(searchQuery) ||
        ordinal.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ordinal.collection?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Aplicar filtros
    if (filters.contentType !== 'all') {
      filtered = filtered.filter(ordinal => ordinal.contentType.startsWith(filters.contentType))
    }

    if (filters.rarity !== 'all') {
      filtered = filtered.filter(ordinal => ordinal.rarity === filters.rarity)
    }

    if (filters.collection !== 'all') {
      filtered = filtered.filter(ordinal => ordinal.collection === filters.collection)
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'number':
          return b.number - a.number
        case 'rarity':
          return b.rarityScore - a.rarityScore
        case 'timestamp':
          return b.timestamp - a.timestamp
        case 'size':
          return b.size - a.size
        default:
          return 0
      }
    })

    setFilteredOrdinals(filtered)
  }, [searchQuery, filters, ordinals])

  const getContentTypeIcon = (contentType: string) => {
    if (contentType.startsWith('image')) return <ImageIcon className="h-4 w-4" />
    if (contentType.startsWith('text')) return <FileText className="h-4 w-4" />
    if (contentType.startsWith('audio')) return <Music className="h-4 w-4" />
    if (contentType.startsWith('video')) return <Video className="h-4 w-4" />
    if (contentType.includes('json') || contentType.includes('javascript')) return <Code className="h-4 w-4" />
    return <Archive className="h-4 w-4" />
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400'
      case 'uncommon': return 'text-green-400 border-green-400'
      case 'rare': return 'text-blue-400 border-blue-400'
      case 'epic': return 'text-purple-400 border-purple-400'
      case 'legendary': return 'text-orange-400 border-orange-400'
      default: return 'text-gray-400 border-gray-400'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-700 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-500" />
            Filtros e Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.contentType} onValueChange={(value) => setFilters(prev => ({ ...prev, contentType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Conteúdo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="image">Imagens</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="application">Aplicações</SelectItem>
                <SelectItem value="audio">Áudio</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.rarity} onValueChange={(value) => setFilters(prev => ({ ...prev, rarity: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Raridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Raridades</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.collection} onValueChange={(value) => setFilters(prev => ({ ...prev, collection: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Coleção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Coleções</SelectItem>
                <SelectItem value="NodeMonkes">NodeMonkes</SelectItem>
                <SelectItem value="Bitcoin Puppets">Bitcoin Puppets</SelectItem>
                <SelectItem value="Ordinal Maxi Biz">Ordinal Maxi Biz</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar Por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="rarity">Raridade</SelectItem>
                <SelectItem value="timestamp">Tempo</SelectItem>
                <SelectItem value="size">Tamanho</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Exibindo {filteredOrdinals.length} de {ordinals.length} inscrições
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Ordinals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrdinals.map((ordinal) => (
          <Card key={ordinal.id} className="group hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getContentTypeIcon(ordinal.contentType)}
                  <span className="text-sm font-medium">#{ordinal.number}</span>
                </div>
                <Badge variant="outline" className={getRarityColor(ordinal.rarity)}>
                  {ordinal.rarity}
                </Badge>
              </div>

              {/* Content Preview */}
              <div className="h-32 bg-muted/30 rounded-lg mb-3 flex items-center justify-center">
                {ordinal.contentType.startsWith('image') ? (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-orange-500" />
                  </div>
                ) : (
                  <div className="text-center">
                    {getContentTypeIcon(ordinal.contentType)}
                    <p className="text-xs text-muted-foreground mt-2">{ordinal.contentType}</p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-2">
                {ordinal.collection && (
                  <p className="text-sm font-medium text-orange-400">{ordinal.collection}</p>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Size: {(ordinal.size / 1024).toFixed(2)} KB</div>
                  <div>Score: {ordinal.rarityScore}</div>
                  <div>Fee: {ordinal.inscription_fee.toLocaleString()} sats</div>
                  <div>{formatTimestamp(ordinal.timestamp)}</div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Owner: {ordinal.owner.slice(0, 12)}...
                </div>

                {/* Attributes */}
                {ordinal.attributes && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ordinal.attributes.slice(0, 3).map((attr, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {attr.trait_type}: {attr.value}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Star className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {filteredOrdinals.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="w-full max-w-md">
            Carregar Mais Inscrições
          </Button>
        </div>
      )}
    </div>
  )
}