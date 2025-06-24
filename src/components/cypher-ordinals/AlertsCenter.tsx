'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Plus, Bell, Settings, Trash2 } from 'lucide-react'

export function AlertsCenter() {
  const activeAlerts = [
    {
      id: 1,
      type: 'price',
      condition: 'ORDI > $50',
      status: 'active',
      triggered: false,
      created: '2024-01-15'
    },
    {
      id: 2,
      type: 'whale',
      condition: 'NodeMonkes whale activity',
      status: 'active',
      triggered: true,
      created: '2024-01-14'
    },
    {
      id: 3,
      type: 'collection',
      condition: 'New Bitcoin Puppets listing',
      status: 'paused',
      triggered: false,
      created: '2024-01-13'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
          Central de Alertas
        </h2>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Alerta
        </Button>
      </div>

      {/* Create Alert Form */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Alerta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Alerta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Mudança de Preço</SelectItem>
                <SelectItem value="whale">Atividade de Baleia</SelectItem>
                <SelectItem value="collection">Nova Inscrição</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
              </SelectContent>
            </Select>
            
            <Input placeholder="Condição (ex: > $50)" />
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Token/Coleção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordi">ORDI</SelectItem>
                <SelectItem value="sats">SATS</SelectItem>
                <SelectItem value="nodemonkes">NodeMonkes</SelectItem>
                <SelectItem value="puppets">Bitcoin Puppets</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-green-600 hover:bg-green-700">
              <Bell className="h-4 w-4 mr-2" />
              Criar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline"
                    className={`${
                      alert.triggered ? 'border-red-500 text-red-400' :
                      alert.status === 'active' ? 'border-green-500 text-green-400' :
                      'border-gray-500 text-gray-400'
                    }`}
                  >
                    {alert.triggered ? 'TRIGGERED' : alert.status.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="font-medium">{alert.condition}</p>
                    <p className="text-sm text-muted-foreground">Criado em {alert.created}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}