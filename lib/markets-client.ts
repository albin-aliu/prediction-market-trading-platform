/**
 * UNIFIED MARKETS CLIENT
 * 
 * Purpose: Single interface for fetching market data from all platforms
 * Currently: Polymarket only (expandable to add more platforms)
 * 
 * Why this exists:
 * - Abstracts platform differences
 * - Easy to add new platforms without changing API routes
 * - Consistent Market interface for components
 * 
 * To add a new platform:
 * 1. Create new API client (e.g., lib/manifold-api.ts)
 * 2. Add to this file: private manifold = new ManifoldAPI()
 * 3. Update getMarkets() to include new platform
 * 4. Update Platform type below
 */

import { PolymarketAPI } from './polymarket-api'
import { Market } from './types'

// Supported platforms (add more as they're integrated)
export type Platform = 'polymarket' | 'all'

export class MarketsClient {
  private polymarket = new PolymarketAPI()

  /**
   * Fetches markets from specified platform
   * 
   * @param params.platform - Which platform to fetch from ('polymarket' or 'all')
   * @param params.limit - Max number of markets to return
   * @returns Array of Market objects in standardized format
   * 
   * Example:
   * const markets = await marketsClient.getMarkets({
   *   platform: 'polymarket',
   *   limit: 20
   * })
   */
  async getMarkets(params: {
    platform?: Platform
    limit?: number
  } = {}): Promise<Market[]> {
    const { platform = 'polymarket', limit = 50 } = params

    try {
      // Currently only Polymarket is integrated
      if (platform === 'polymarket' || platform === 'all') {
        return await this.polymarket.getSimplifiedMarkets(limit)
      }

      // Future platforms will be added here
      // if (platform === 'manifold') {
      //   return await this.manifold.getSimplifiedMarkets(limit)
      // }

      return []
    } catch (error) {
      console.error('Error fetching markets:', error)
      return []
    }
  }

  /**
   * Fetches a single market by ID
   * 
   * @param id - Market condition ID
   * @param platform - Which platform the market is on
   * @returns Single Market object or null if not found
   */
  async getMarket(id: string, platform: 'polymarket'): Promise<Market | null> {
    try {
      if (platform === 'polymarket') {
        const market = await this.polymarket.getMarket(id)
        if (!market) return null

        // Parse outcomes and prices
        const outcomes = JSON.parse(market.outcomes || '[]')
        const prices = JSON.parse(market.outcomePrices || '[]')
        
        const yesIndex = outcomes.findIndex((o: string) => o.toLowerCase() === 'yes')
        const noIndex = outcomes.findIndex((o: string) => o.toLowerCase() === 'no')
        
        const yesPrice = yesIndex >= 0 ? parseFloat(prices[yesIndex] || '0') : 0
        const noPrice = noIndex >= 0 ? parseFloat(prices[noIndex] || '0') : 0

        return {
          id: market.conditionId,
          platform: 'polymarket',
          title: market.question,
          description: market.description || '',
          status: (market.active && !market.closed ? 'open' : 'closed') as 'open' | 'closed',
          volume_24h: market.volumeNum || 0,
          liquidity: market.liquidityNum || 0,
          yesPrice,
          noPrice,
          createdAt: new Date(),
          expiresAt: new Date(market.endDateIso),
          image: market.image,
          icon: market.icon,
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching market:', error)
      return null
    }
  }

  /**
   * Searches markets by title keyword
   * 
   * @param query - Search term (case-insensitive)
   * @param limit - Max results to return
   * @returns Filtered array of Market objects
   * 
   * Example:
   * const results = await marketsClient.searchMarkets('bitcoin', 10)
   */
  async searchMarkets(query: string, limit = 20): Promise<Market[]> {
    // Fetch more markets to search through
    const allMarkets = await this.getMarkets({ platform: 'all', limit: 100 })
    
    // Filter by title (case-insensitive)
    const searchLower = query.toLowerCase()
    return allMarkets
      .filter(m => m.title.toLowerCase().includes(searchLower))
      .slice(0, limit)
  }
}

/**
 * Export singleton instance
 * Use this in API routes instead of creating new instances
 * 
 * Example:
 * import { marketsClient } from '@/lib/markets-client'
 * const markets = await marketsClient.getMarkets({ limit: 20 })
 */
export const marketsClient = new MarketsClient()
