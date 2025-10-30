import { NextRequest, NextResponse } from 'next/server'
import { marketsClient } from '@/lib/markets-client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const platform = searchParams.get('platform') as 'polymarket' | 'kalshi' | 'all' | null
    const limit = parseInt(searchParams.get('limit') || '50')

    // Fetch markets directly from platforms
    const markets = await marketsClient.getMarkets({
      platform: platform || 'all',
      limit
    })

    return NextResponse.json({
      success: true,
      count: markets.length,
      markets,
      params: {
        platform: platform || 'all',
        limit
      }
    })
  } catch (error: any) {
    console.error('Error in markets API:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch markets',
      message: error.message || 'Unknown error',
      markets: []
    }, { status: 500 })
  }
}
