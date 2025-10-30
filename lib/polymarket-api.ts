/**
 * POLYMARKET API CLIENT
 * 
 * Purpose: Direct integration with Polymarket's public API
 * Base URL: https://gamma-api.polymarket.com
 * Docs: https://docs.polymarket.com
 * 
 * Key Features:
 * - No API key required (public endpoints)
 * - Fetches live market data with images
 * - Parses JSON string fields (outcomes, prices)
 * - Filters for active, non-closed markets only
 * 
 * Main Methods:
 * - getMarkets(limit): Raw market data from API
 * - getSimplifiedMarkets(limit): Cleaned data in standard format
 * - getMarket(id): Single market by condition ID
 * 
 * Used By:
 * - lib/markets-client.ts (unified client)
 * - app/api/markets/route.ts (markets endpoint)
 * - app/api/arbitrage/route.ts (arbitrage detection)
 */

/**
 * Raw market data structure from Polymarket API
 * Note: 'outcomes' and 'outcomePrices' are JSON STRINGS (must parse!)
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

  /**
   * Fetches raw market data from Polymarket
   * 
   * @param limit - Number of markets to return (default: 50)
   * @returns Array of raw PolymarketMarket objects
   * 
   * Process:
   * 1. Request 3x limit (many markets are closed/inactive)
   * 2. Filter for active=true and closed=false
   * 3. Return first {limit} results
   * 
   * Example response:
   * {
   *   conditionId: "0x123...",
   *   question: "Will Bitcoin reach $100k?",
   *   outcomes: '["Yes","No"]',     // JSON string!
   *   outcomePrices: '["0.65","0.35"]',  // JSON string!
   *   volumeNum: 1234567,
   *   image: "https://polymarket-upload.s3..."
   * }
   */
  async getMarkets(limit = 50): Promise<PolymarketMarket[]> {
    try {
      // Fetch 3x limit because many markets are closed/inactive
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
      
      // Double-check filters and limit results
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

  /**
   * Transforms raw Polymarket data into standardized format
   * 
   * @param limit - Number of markets to return
   * @returns Array of simplified Market objects
   * 
   * Process:
   * 1. Fetch raw markets from API
   * 2. Parse JSON strings (outcomes, outcomePrices)
   * 3. Extract YES/NO prices from arrays
   * 4. Convert to standard Market interface
   * 5. Include images for display
   * 
   * Note: Polymarket returns outcomes as:
   *   outcomes: '["Yes", "No"]'       ← JSON string!
   *   outcomePrices: '["0.65", "0.35"]' ← JSON string!
   * 
   * We must:
   * 1. JSON.parse() both strings
   * 2. Find index of "Yes" and "No"
   * 3. Extract corresponding prices
   */
  async getSimplifiedMarkets(limit = 50) {
    const markets = await this.getMarkets(limit)
    
    return markets.map(m => {
      try {
        // CRITICAL: Parse JSON strings from API
        const outcomes = JSON.parse(m.outcomes || '[]')
        const prices = JSON.parse(m.outcomePrices || '[]')
        
        // Find array indices for YES and NO outcomes
        const yesIndex = outcomes.findIndex((o: string) => o.toLowerCase() === 'yes')
        const noIndex = outcomes.findIndex((o: string) => o.toLowerCase() === 'no')
        
        // Extract prices at those indices
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

