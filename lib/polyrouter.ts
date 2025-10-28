// PolyRouter API client
// Documentation: https://www.polyrouter.io/

import { Market, Platform, MarketStatus } from './types'

export class PolyRouterClient {
  private apiKey: string
  private baseUrl: string = 'https://api.polyrouter.io/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getMarkets(params: {
    platform?: Platform
    status?: MarketStatus
    limit?: number
  }): Promise<Market[]> {
    try {
      const queryParams = new URLSearchParams()
      if (params.platform) queryParams.append('platform', params.platform)
      if (params.status) queryParams.append('status', params.status)
      if (params.limit) queryParams.append('limit', params.limit.toString())

      const url = `${this.baseUrl}/markets?${queryParams.toString()}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Transform API response to our Market type
      return this.transformMarketsData(data)
    } catch (error) {
      console.error('Error fetching markets:', error)
      throw error
    }
  }

  private transformMarketsData(data: any): Market[] {
    // Handle different response formats
    const markets = data.markets || data.data || data
    
    if (!Array.isArray(markets)) {
      return []
    }

    return markets.map((m: any) => ({
      id: m.id || m.market_id || m.marketId,
      platform: m.platform,
      title: m.title || m.question || m.name,
      description: m.description,
      status: m.status || 'open',
      volume_24h: m.volume_24h || m.volume || m.volumeUSD,
      liquidity: m.liquidity,
      yesPrice: m.yesPrice || m.yes_price || m.lastTradePrice,
      noPrice: m.noPrice || m.no_price,
      createdAt: new Date(m.createdAt || m.created_at || Date.now()),
      expiresAt: m.expiresAt || m.expires_at ? new Date(m.expiresAt || m.expires_at) : undefined,
    }))
  }

  async getMarket(marketId: string): Promise<Market | null> {
    try {
      const response = await fetch(`${this.baseUrl}/markets/${marketId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const markets = this.transformMarketsData([data])
      return markets[0] || null
    } catch (error) {
      console.error('Error fetching market:', error)
      return null
    }
  }

  async getPriceHistory(marketId: string, timeframe?: string): Promise<any[]> {
    try {
      const queryParams = timeframe ? `?timeframe=${timeframe}` : ''
      const response = await fetch(
        `${this.baseUrl}/markets/${marketId}/history${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching price history:', error)
      return []
    }
  }
}

export function createPolyRouterClient(): PolyRouterClient | null {
  const apiKey = process.env.POLYROUTER_API_KEY
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn('POLYROUTER_API_KEY not set or using default value')
    return null
  }
  return new PolyRouterClient(apiKey)
}

