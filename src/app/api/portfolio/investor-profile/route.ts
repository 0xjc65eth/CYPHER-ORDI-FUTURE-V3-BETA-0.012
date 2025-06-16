import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Get the wallet address from the URL
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // In a real implementation, this would fetch data from a database or external API
    // For demo purposes, we'll use mock data
    
    // Mock investor profile data
    const profileData = {
      profile: 'Moderate',
      riskTolerance: 65,
      timeHorizon: 80,
      diversity: 45,
      recommendations: [
        'Consider increasing your portfolio diversity by adding more Runes',
        'Your long-term horizon suggests you could benefit from rare ordinals',
        'Set up automatic BTC purchases to dollar-cost average',
        'Consider exploring rare sats collections for long-term value'
      ]
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error('Error fetching investor profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch investor profile' },
      { status: 500 }
    )
  }
}
