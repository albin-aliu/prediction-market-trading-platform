/**
 * Unified Markets Client
 * Aggregates data from multiple prediction market platforms
 */

import { PolymarketAPI } from './polymarket-api'
import { KalshiAPI } from './kalshi-api'
import { Market } from './types'

export type Platform = 'polymarket' | 'kalshi' | 'all'

export class MarketsClient {
  private polymarket = new PolymarketAPI()
  private kalshi = new KalshiAPI()

  /**
   * Get markets from specified platform(s)
   */
  async getMarkets(params: {
    platform?: Platform
    limit?: number
  } = {}): Promise<Market[]> {
    const { platform = 'all', limit = 50 } = params

    try {
      if (platform === 'polymarket') {
        return await this.polymarket.getSimplifiedMarkets(limit)
      }

      if (platform === 'kalshi') {
        return await this.kalshi.getSimplifiedMarkets(limit)
      }

      // Get from all platforms
      const [polymarketMarkets, kalshiMarkets] = await Promise.all([
        this.polymarket.getSimplifiedMarkets(limit).catch(() => []),
        this.kalshi.getSimplifiedMarkets(limit).catch(() => []),
      ])

      // Combine and sort by volume
      const allMarkets = [...polymarketMarkets, ...kalshiMarkets]
      return allMarkets
        .sort((a, b) => (b.volume_24h || 0) - (a.volume_24h || 0))
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching markets:', error)
      return []
    }
  }

  /**
   * Get a specific market by ID and platform
   */
  async getMarket(id: string, platform: 'polymarket' | 'kalshi'): Promise<Market | null> {
    try {
      if (platform === 'polymarket') {
        const market = await this.polymarket.getMarket(id)
        if (!market) return null

        return {
          id: market.condition_id,
          platform: 'polymarket',
          title: market.question,
          description: market.description || '',
          status: market.active && !market.closed ? 'open' : 'closed',
          volume_24h: market.volume || 0,
          liquidity: market.liquidity || 0,
          yesPrice: market.tokens.find(t => t.outcome === 'Yes')?.price || 0,
          noPrice: market.tokens.find(t => t.outcome === 'No')?.price || 0,
          createdAt: new Date(),
          expiresAt: new Date(market.end_date_iso),
        }
      }

      if (platform === 'kalshi') {
        const market = await this.kalshi.getMarket(id)
        if (!market) return null

        const yesPrice = market.yes_bid && market.yes_ask 
          ? (market.yes_bid + market.yes_ask) / 2 / 100
          : 0
        
        const noPrice = market.no_bid && market.no_ask
          ? (market.no_bid + market.no_ask) / 2 / 100
          : (1 - yesPrice)

        return {
          id: market.ticker,
          platform: 'kalshi',
          title: market.title,
          description: `${market.category} - ${market.event_ticker}`,
          status: market.status.toLowerCase() as 'open' | 'closed',
          volume_24h: market.volume || 0,
          liquidity: market.open_interest || 0,
          yesPrice,
          noPrice,
          createdAt: new Date(),
          expiresAt: new Date(market.close_time),
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching market:', error)
      return null
    }
  }

  /**
   * Search markets by title
   */
  async searchMarkets(query: string, limit = 20): Promise<Market[]> {
    const allMarkets = await this.getMarkets({ platform: 'all', limit: 100 })
    
    const searchLower = query.toLowerCase()
    return allMarkets
      .filter(m => m.title.toLowerCase().includes(searchLower))
      .slice(0, limit)
  }
}

// Export singleton instance
export const marketsClient = new MarketsClient()

