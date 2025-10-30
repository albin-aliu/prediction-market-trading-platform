/**
 * Direct Kalshi API Client
 * Docs: https://trading-api.readme.io/reference/getting-started
 */

export interface KalshiMarket {
  ticker: string
  event_ticker: string
  title: string
  category: string
  status: string
  yes_bid: number
  yes_ask: number
  no_bid: number
  no_ask: number
  volume: number
  open_interest: number
  expiration_time: string
  close_time: string
}

export class KalshiAPI {
  private baseUrl = 'https://trading-api.kalshi.com/trade-api/v2'

  async getMarkets(limit = 100): Promise<KalshiMarket[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/markets?limit=${limit}&status=open`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.warn(`Kalshi API error: ${response.statusText}`)
        return []
      }

      const data = await response.json()
      return data.markets || []
    } catch (error) {
      console.error('Failed to fetch Kalshi markets:', error)
      return []
    }
  }

  async getMarket(ticker: string): Promise<KalshiMarket | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/markets/${ticker}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.market || null
    } catch (error) {
      console.error('Failed to fetch Kalshi market:', error)
      return null
    }
  }

  // Get simplified market data in our standard format
  async getSimplifiedMarkets(limit = 100) {
    const markets = await this.getMarkets(limit)
    
    return markets
      .filter(m => m.yes_bid > 0 || m.yes_ask > 0) // Filter out markets with no prices
      .map(m => {
        // Calculate mid prices
        const yesPrice = m.yes_bid && m.yes_ask 
          ? (m.yes_bid + m.yes_ask) / 2 / 100 // Kalshi prices are in cents
          : m.yes_bid / 100 || m.yes_ask / 100 || 0
        
        const noPrice = m.no_bid && m.no_ask
          ? (m.no_bid + m.no_ask) / 2 / 100
          : m.no_bid / 100 || m.no_ask / 100 || (1 - yesPrice)

        const status = m.status.toLowerCase() === 'open' ? 'open' : 'closed'
        
        return {
          id: m.ticker,
          platform: 'kalshi' as const,
          title: m.title,
          description: `${m.category} - ${m.event_ticker}`,
          status: status as 'open' | 'closed',
          volume_24h: m.volume || 0,
          liquidity: m.open_interest || 0,
          yesPrice,
          noPrice,
          createdAt: new Date(),
          expiresAt: new Date(m.close_time),
        }
      })
  }
}

