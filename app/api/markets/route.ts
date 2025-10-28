import { NextRequest, NextResponse } from 'next/server'
import { createPolyRouterClient } from '@/lib/polyrouter'
import { Platform, MarketStatus } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const platform = searchParams.get('platform') as Platform | null
    const status = searchParams.get('status') as MarketStatus | null
    const limit = parseInt(searchParams.get('limit') || '20')

    // Create PolyRouter client
    const client = createPolyRouterClient()
    
    if (!client) {
      return NextResponse.json({
        error: 'PolyRouter API key not configured',
        message: 'Please set POLYROUTER_API_KEY in your .env file',
        markets: []
      }, { status: 500 })
    }

    // Fetch markets from PolyRouter
    const markets = await client.getMarkets({
      platform: platform || undefined,
      status: status || undefined,
      limit
    })

    return NextResponse.json({
      success: true,
      count: markets.length,
      markets,
      params: {
        platform: platform || 'all',
        status: status || 'all',
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

