'use client'

import { useState, useEffect } from 'react'
import { TopNavLayout } from '@/components/layout/TopNavLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  TrendingUp, 
  Users, 
  Activity, 
  Layers, 
  Filter,
  Bitcoin,
  Eye,
  Wallet,
  AlertTriangle,
  BarChart3,
  Hash
} from 'lucide-react'
import { CypherOrdinalsDashboard } from '@/components/cypher-ordinals/CypherOrdinalsDashboard'
import { OrdinalsExplorer } from '@/components/cypher-ordinals/OrdinalsExplorer'
import { BRC20Explorer } from '@/components/cypher-ordinals/BRC20Explorer'
import { WhaleTracker } from '@/components/cypher-ordinals/WhaleTracker'
import { SocialFeed } from '@/components/cypher-ordinals/SocialFeed'
import { AlertsCenter } from '@/components/cypher-ordinals/AlertsCenter'
import { AnalyticsCharts } from '@/components/cypher-ordinals/AnalyticsCharts'

export default function OrdinalsPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <TopNavLayout>
      <div className="bg-background min-h-screen">
        {/* Header Section */}
        <div className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  ORDINALS INTELLIGENCE HUB
                </h1>
                <p className="text-muted-foreground mt-1">
                  Análise Avançada de Ordinals & BRC-20 • Dados em Tempo Real • Rastreamento de Baleias
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400">APIs Ativas</span>
                </div>
                <Badge variant="outline" className="text-orange-400 border-orange-400">
                  Professional
                </Badge>
              </div>
            </div>

            {/* Global Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID de inscrição, endereço, token BRC-20, coleção..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 focus:border-orange-500 h-12"
                />
              </div>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Filter className="h-4 w-4" />
              </Button>
              <Button className="h-12 bg-orange-600 hover:bg-orange-700">
                <Search className="h-4 w-4 mr-2" />
                Pesquisar
              </Button>
            </div>

            {/* Quick Metrics Bar */}
            {!isLoading && (
              <div className="grid grid-cols-6 gap-4">
                <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Inscrições</p>
                        <p className="text-xl font-bold text-orange-400">65.2M</p>
                      </div>
                      <Hash className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tokens BRC-20</p>
                        <p className="text-xl font-bold text-blue-400">28.4K</p>
                      </div>
                      <Layers className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Volume 24h</p>
                        <p className="text-xl font-bold text-green-400">₿2.8K</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Baleias Ativas</p>
                        <p className="text-xl font-bold text-purple-400">1.2K</p>
                      </div>
                      <Eye className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                        <p className="text-xl font-bold text-yellow-400">847</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa Rede</p>
                        <p className="text-xl font-bold text-red-400">45 sat/vB</p>
                      </div>
                      <Bitcoin className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-7 w-full max-w-5xl mx-auto h-12">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="ordinals" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Ordinals
              </TabsTrigger>
              <TabsTrigger value="brc20" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                BRC-20
              </TabsTrigger>
              <TabsTrigger value="whales" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Baleias
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Social
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alertas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <CypherOrdinalsDashboard searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="ordinals" className="space-y-6">
              <OrdinalsExplorer searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="brc20" className="space-y-6">
              <BRC20Explorer searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="whales" className="space-y-6">
              <WhaleTracker />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsCharts />
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <SocialFeed />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <AlertsCenter />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TopNavLayout>
  )
}