/**
 * Direct Polymarket API Client
 * Docs: https://docs.polymarket.com
 */

export interface PolymarketMarket {
  id: string
  conditionId: string
  question: string
  description?: string
  endDate: string
  endDateIso: string
  outcomes: string
  outcomePrices: string
  active: boolean
  closed: boolean
  slug: string
  volume: string
  volumeNum: number
  liquidity: string
  liquidityNum: number
  image?: string
  icon?: string
  category?: string
}

export class PolymarketAPI {
  private baseUrl = 'https://gamma-api.polymarket.com'

  async getMarkets(limit = 50): Promise<PolymarketMarket[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/markets?limit=${limit * 3}&active=true&closed=false`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Polymarket API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Filter for actually open markets and limit results
      return (data || [])
        .filter((m: PolymarketMarket) => m.active && !m.closed)
        .slice(0, limit)
    } catch (error) {
      console.error('Failed to fetch Polymarket markets:', error)
      return []
    }
  }

  async getMarket(conditionId: string): Promise<PolymarketMarket | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/markets/${conditionId}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch Polymarket market:', error)
      return null
    }
  }

  // Get simplified market data in our standard format
  async getSimplifiedMarkets(limit = 50) {
    const markets = await this.getMarkets(limit)
    
    return markets.map(m => {
      try {
        // Parse outcomes and prices from JSON strings
        const outcomes = JSON.parse(m.outcomes || '[]')
        const prices = JSON.parse(m.outcomePrices || '[]')
        
        // Find Yes/No prices
        const yesIndex = outcomes.findIndex((o: string) => o.toLowerCase() === 'yes')
        const noIndex = outcomes.findIndex((o: string) => o.toLowerCase() === 'no')
        
        const yesPrice = yesIndex >= 0 ? parseFloat(prices[yesIndex] || '0') : 0
        const noPrice = noIndex >= 0 ? parseFloat(prices[noIndex] || '0') : 0
        
        return {
          id: m.conditionId,
          platform: 'polymarket' as const,
          title: m.question,
          description: m.description || '',
          status: (m.active && !m.closed ? 'open' : 'closed') as 'open' | 'closed',
          volume_24h: m.volumeNum || 0,
          liquidity: m.liquidityNum || 0,
          yesPrice,
          noPrice,
          createdAt: new Date(),
          expiresAt: new Date(m.endDateIso),
          image: m.image,
          icon: m.icon,
        }
      } catch (error) {
        console.error('Error parsing market:', error)
        return {
          id: m.conditionId,
          platform: 'polymarket' as const,
          title: m.question,
          description: m.description || '',
          status: 'closed' as const,
          volume_24h: 0,
          liquidity: 0,
          yesPrice: 0,
          noPrice: 0,
          createdAt: new Date(),
          expiresAt: new Date(),
        }
      }
    })
  }
}

