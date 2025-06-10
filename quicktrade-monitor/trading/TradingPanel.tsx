'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowUpRight, ArrowDownRight, AlertCircle, 
  CheckCircle2, Loader2, TrendingUp, TrendingDown 
} from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
// import { binanceEngine } from '@/lib/trading/trading-engine'
// import { useWebSocketPrice } from '@/hooks/useWebSocketPrice'

export default function TradingPanel({ 
  symbol = 'BTCUSDT', 
  exchange = 'binance' 
}) {
  const { connected: isConnected, address } = useWallet()
  // const { prices, getBestPrice } = useWebSocketPrice({ symbols: [symbol] })
  
  const [side, setSide] = useState('buy')
  const [orderType, setOrderType] = useState('market')
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const currentPrice = 0 // getBestPrice(symbol, side as 'buy' | 'sell')?.price || 0

  const handleExecuteOrder = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    setIsExecuting(true)
    setError(null)

    try {
      const orderParams = {
        symbol,
        side: side as 'buy' | 'sell',
        type: orderType as 'market' | 'limit' | 'stop' | 'stop-limit',
        quantity: parseFloat(amount),
        price: orderType !== 'market' ? parseFloat(price) : undefined
      }

      // const result = await binanceEngine.createOrder(orderParams)
      const result = { success: false, message: 'Trading engine not configured' }
      setOrderResult(result)
      setAmount('')
      setPrice('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute order')
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Trading Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-2xl font-bold">
            ${typeof currentPrice === 'number' ? currentPrice.toLocaleString() : '0'}
          </div>
        </div>

        <Tabs value={side} onValueChange={setSide}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>

          <TabsContent value={side} className="space-y-4">
            <div>
              <Label>Order Type</Label>
              <Tabs value={orderType} onValueChange={setOrderType}>
                <TabsList>
                  <TabsTrigger value="market">Market</TabsTrigger>
                  <TabsTrigger value="limit">Limit</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {orderType === 'limit' && (
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full"
              onClick={handleExecuteOrder}
              disabled={!isConnected || isExecuting}
            >
              {isExecuting ? 'Executing...' : `${side} ${symbol}`}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}