'use client'
import { Header } from '@/components/header'
import { Card, Title, Text, Grid, Col, LineChart, BarChart, AreaChart, ProgressBar, Flex } from '@tremor/react'

export default function TradingPage() {
  // Mock data para gráficos e variáveis (substitua por hooks reais depois)
  const priceData = [
    { time: '09:00', open: 65000, high: 65200, low: 64800, close: 65100, volume: 120 },
    { time: '10:00', open: 65100, high: 65300, low: 65000, close: 65250, volume: 150 },
    { time: '11:00', open: 65250, high: 65500, low: 65100, close: 65400, volume: 180 },
    { time: '12:00', open: 65400, high: 65600, low: 65300, close: 65550, volume: 200 },
    { time: '13:00', open: 65550, high: 65700, low: 65400, close: 65600, volume: 170 },
  ]
  const rsiData = [45, 52, 60, 58, 62]
  const macdData = [0.01, 0.03, 0.02, 0.04, 0.05]
  const smcZones = [
    { label: 'Order Block', price: 65200 },
    { label: 'Support', price: 65000 },
    { label: 'Resistance', price: 65700 },
  ]
  const neuralInsight = {
    bias: 'Bullish',
    confidence: 'Alta',
    rationale: 'Volume crescente, RSI acima de 60 e fluxo institucional positivo.',
    entry: 65400,
    target: 65700,
    stop: 65100,
  }
  const variables = [
    { label: 'Funding Rate', value: '+0.012%', color: 'emerald' },
    { label: 'Open Interest', value: '$1.2B', color: 'blue' },
    { label: 'Long/Short', value: '1.8', color: 'rose' },
    { label: 'Volatilidade', value: '3.2%', color: 'violet' },
    { label: 'Sentimento', value: 'Greed', color: 'amber' },
    { label: 'Liquidity', value: '$1.5B', color: 'cyan' },
  ]
  const trades = [
    { time: '12:01', price: 65500, size: 0.2, side: 'Buy' },
    { time: '12:03', price: 65480, size: 0.1, side: 'Sell' },
    { time: '12:05', price: 65520, size: 0.3, side: 'Buy' },
  ]
  const orderbook = [
    { price: 65510, size: 0.5, side: 'Ask' },
    { price: 65500, size: 0.7, side: 'Bid' },
    { price: 65490, size: 0.4, side: 'Bid' },
    { price: 65520, size: 0.3, side: 'Ask' },
  ]

  return (
    <main className="min-h-screen bg-[#181A20]">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2 text-white">TRADING</h1>
        <h2 className="text-lg text-gray-400 mb-6">Painel de Análise Profissional</h2>
        <Grid numItems={1} numItemsLg={2} className="gap-6 mb-6">
          <Col>
            <Card className="bg-[#23272F] border-none shadow-xl p-6">
              <Title className="text-white text-xl mb-2">Gráfico de Preço (Candlestick)</Title>
              {/* Substitua por um componente de candlestick real se desejar */}
              <AreaChart
                className="h-56"
                data={priceData}
                index="time"
                categories={["close"]}
                colors={["emerald"]}
                showAnimation
                showLegend={false}
                showGridLines={false}
                valueFormatter={v => `$${v}`}
              />
              <div className="flex gap-4 mt-4">
                <div className="flex-1">
                  <Text className="text-xs text-gray-400">RSI</Text>
                  <ProgressBar value={rsiData[rsiData.length-1]} color="violet" />
                  <Text className="text-xs text-gray-300">{rsiData[rsiData.length-1]}</Text>
                </div>
                <div className="flex-1">
                  <Text className="text-xs text-gray-400">MACD</Text>
                  <ProgressBar value={Math.abs(macdData[macdData.length-1]*100)} color="emerald" />
                  <Text className="text-xs text-gray-300">{macdData[macdData.length-1]}</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col>
            <Card className="bg-[#20232B] border-none shadow-xl p-6">
              <Title className="text-white text-xl mb-2">SMC & Zonas Institucionais</Title>
              <ul className="space-y-2">
                {smcZones.map((z, i) => (
                  <li key={i} className="flex justify-between text-gray-200">
                    <span>{z.label}</span>
                    <span className="font-bold">${z.price}</span>
                  </li>
                ))}
              </ul>
              <Text className="mt-4 text-xs text-gray-400">Zonas de interesse institucional, order blocks e pivôs automáticos.</Text>
            </Card>
          </Col>
        </Grid>
        <Grid numItems={1} numItemsLg={2} className="gap-6 mb-6">
          <Col>
            <Card className="bg-[#23272F] border-none shadow-xl p-6">
              <Title className="text-white text-xl mb-2">Insights Neurais</Title>
              <Text className="text-lg font-bold">Sinal: {neuralInsight.bias}</Text>
              <Text className="text-gray-300">Confiança: {neuralInsight.confidence}</Text>
              <Text className="text-gray-400 text-sm">{neuralInsight.rationale}</Text>
              <div className="flex gap-4 mt-4">
                <div className="flex-1 text-xs text-gray-400">Entrada<br /><span className="text-white font-bold">${neuralInsight.entry}</span></div>
                <div className="flex-1 text-xs text-gray-400">Alvo<br /><span className="text-green-400 font-bold">${neuralInsight.target}</span></div>
                <div className="flex-1 text-xs text-gray-400">Stop<br /><span className="text-rose-400 font-bold">${neuralInsight.stop}</span></div>
              </div>
            </Card>
          </Col>
          <Col>
            <Card className="bg-[#20232B] border-none shadow-xl p-6">
              <Title className="text-white text-xl mb-2">Variáveis Essenciais</Title>
              <ul className="mt-2 space-y-2">
                {variables.map((v, i) => (
                  <li key={i} className={`font-bold text-${v.color}-400 flex justify-between`}>
                    <span>{v.label}</span>
                    <span className={`text-${v.color}-300`}>{v.value}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
        </Grid>
        <Grid numItems={1} numItemsLg={2} className="gap-6 mb-6">
          <Col>
            <Card className="bg-[#23272F] border-none shadow-xl p-6">
              <Title className="text-white text-xl mb-2">Trades Recentes</Title>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-400">
                      <th className="pr-4">Horário</th>
                      <th className="pr-4">Preço</th>
                      <th className="pr-4">Tamanho</th>
                      <th className="pr-4">Side</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t, i) => (
                      <tr key={i} className="border-b border-gray-700">
                        <td className="pr-4">{t.time}</td>
                        <td className="pr-4">${t.price}</td>
                        <td className="pr-4">{t.size}</td>
                        <td className={`pr-4 font-bold ${t.side === 'Buy' ? 'text-green-400' : 'text-rose-400'}`}>{t.side}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>
          <Col>
            <Card className="bg-[#20232B] border-none shadow-xl p-6">
              <Title className="text-white text-xl mb-2">Orderbook Resumido</Title>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-400">
                      <th className="pr-4">Preço</th>
                      <th className="pr-4">Tamanho</th>
                      <th className="pr-4">Side</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderbook.map((o, i) => (
                      <tr key={i} className="border-b border-gray-700">
                        <td className="pr-4">${o.price}</td>
                        <td className="pr-4">{o.size}</td>
                        <td className={`pr-4 font-bold ${o.side === 'Bid' ? 'text-green-400' : 'text-rose-400'}`}>{o.side}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>
        </Grid>
      </div>
    </main>
  )
} 