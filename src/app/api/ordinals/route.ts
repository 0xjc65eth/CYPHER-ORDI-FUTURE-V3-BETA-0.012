import { NextResponse } from 'next/server'

// Mock data para Ordinals
const ordinalsData = {
  total_inscriptions: 67234567,
  volume_24h: 1234567,
  floor_price: 0.0045,
  collections_count: 1247,
  recent_sales: [
    { id: '#67234567', price: 0.045, time: '2 minutes ago' },
    { id: '#67234566', price: 0.032, time: '5 minutes ago' },
    { id: '#67234565', price: 0.028, time: '8 minutes ago' }
  ],
  trending_collections: [
    { name: 'NodeMonkes', floor: 0.045, volume: 123.4, change: 15.2 },
    { name: 'Bitcoin Puppets', floor: 0.032, volume: 89.7, change: 8.9 },
    { name: 'Runestones', floor: 0.028, volume: 76.2, change: -3.1 }
  ]
}

export async function GET(request: Request) {
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return NextResponse.json({
      success: true,
      data: ordinalsData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Ordinals API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ordinals data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Aqui você pode processar dados enviados
    console.log('Ordinals POST request:', body)
    
    return NextResponse.json({
      success: true,
      message: 'Ordinals data processed',
      data: body
    })
  } catch (error) {
    console.error('Ordinals POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process ordinals data' },
      { status: 500 }
    )
  }
}