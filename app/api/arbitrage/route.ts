import { NextRequest, NextResponse } from 'next/server'
import { marketsClient } from '@/lib/markets-client'
import { Market } from '@/lib/types'

interface ArbitrageOpportunity {
  event: string
  market1: Market | null
  market2: Market | null
  spread: number
  profitPotential: number
  category: string
  imageUrl?: string
}

// Enhanced string similarity function to match markets across platforms
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  const s2 = str2.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  
  // If strings are too different in length, likely not a match
  const lengthRatio = Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length)
  if (lengthRatio < 0.3) return 0
  
  const words1 = s1.split(/\s+/).filter(w => w.length > 2)
  const words2 = s2.split(/\s+/).filter(w => w.length > 2)
  
  // Count matching important words (longer words are more important)
  let matchScore = 0
  let totalWeight = 0
  
  words1.forEach(word1 => {
    const weight = Math.min(word1.length / 3, 3) // Weight longer words more
    totalWeight += weight
    
    // Check for exact match or substring match
    const hasMatch = words2.some(word2 => 
      word1 === word2 || 
      word1.includes(word2) || 
      word2.includes(word1) ||
      (word1.length > 4 && word2.length > 4 && 
       (word1.substring(0, 5) === word2.substring(0, 5)))
    )
    
    if (hasMatch) {
      matchScore += weight
    }
  })
  
  return totalWeight > 0 ? matchScore / totalWeight : 0
}

function categorizeMarket(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('election') || t.includes('president') || t.includes('trump') || t.includes('biden') || t.includes('congress') || t.includes('senate')) {
    return 'Politics'
  }
  if (t.includes('nfl') || t.includes('nba') || t.includes('mlb') || t.includes('super bowl') || t.includes('championship')) {
    return 'Sports'
  }
  if (t.includes('bitcoin') || t.includes('crypto') || t.includes('ethereum') || t.includes('btc') || t.includes('eth')) {
    return 'Crypto'
  }
  if (t.includes('stock') || t.includes('market') || t.includes('recession') || t.includes('gdp') || t.includes('inflation')) {
    return 'Economics'
  }
  if (t.includes('movie') || t.includes('film') || t.includes('oscar') || t.includes('emmy') || t.includes('grammy')) {
    return 'Entertainment'
  }
  if (t.includes('ai') || t.includes('tech') || t.includes('apple') || t.includes('tesla') || t.includes('spacex')) {
    return 'Technology'
  }
  return 'Other'
}

function calculateSpread(market1: Market | null, market2: Market | null): number {
  if (!market1?.yesPrice || !market2?.yesPrice) return 0
  return Math.abs(market1.yesPrice - market2.yesPrice)
}

function calculateProfit(spread: number, amount: number = 100): number {
  // Simplified profit calculation
  // Assumes you can buy at one price and sell at another
  return spread * amount
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '5')

    // Fetch open markets from multiple platforms using direct APIs
    const [polymarketMarkets, kalshiMarkets] = await Promise.all([
      marketsClient.getMarkets({ platform: 'polymarket', limit: 100 }),
      marketsClient.getMarkets({ platform: 'kalshi', limit: 100 }),
    ])
    
    console.log(`Fetched ${polymarketMarkets.length} Polymarket, ${kalshiMarkets.length} Kalshi markets`)
    
    // Filter markets to only include those with prices and volume
    const validPolyMarkets = polymarketMarkets.filter(m => 
      m.yesPrice !== undefined && 
      m.yesPrice !== null &&
      m.yesPrice > 0 &&
      m.yesPrice < 1 &&
      (m.volume_24h === undefined || m.volume_24h === null || m.volume_24h > 0)
    )
    
    const validKalshiMarkets = kalshiMarkets.filter(m => 
      m.yesPrice !== undefined && 
      m.yesPrice !== null &&
      m.yesPrice > 0 &&
      m.yesPrice < 1 &&
      (m.volume_24h === undefined || m.volume_24h === null || m.volume_24h > 0)
    )
    
    console.log(`Valid markets: ${validPolyMarkets.length} Polymarket, ${validKalshiMarkets.length} Kalshi`)
    
    // Use Kalshi markets for comparison
    const secondaryMarkets = kalshiMarkets

    // Find matching markets and calculate arbitrage opportunities
    const opportunities: ArbitrageOpportunity[] = []
    const matchedSecondary = new Set<string>()

    for (const polyMarket of validPolyMarkets) {
      // Try to find a matching market in secondary platforms
      let bestMatch: Market | null = null
      let bestSimilarity = 0

      for (const secondaryMarket of secondaryMarkets) {
        if (matchedSecondary.has(secondaryMarket.id)) continue

        const similarity = calculateSimilarity(polyMarket.title, secondaryMarket.title)
        
        if (similarity > bestSimilarity && similarity > 0.3) {
          bestSimilarity = similarity
          bestMatch = secondaryMarket
        }
      }

      if (bestMatch) {
        matchedSecondary.add(bestMatch.id)
        
        const spread = calculateSpread(polyMarket, bestMatch)
        
        console.log(`Match found: "${polyMarket.title}" <-> "${bestMatch.title}" (similarity: ${bestSimilarity.toFixed(2)}, spread: ${(spread * 100).toFixed(1)}%)`)
        
        // Only include if there's a meaningful spread (> 0.5%)
        if (spread > 0.005) {
          opportunities.push({
            event: polyMarket.title,
            market1: polyMarket,
            market2: bestMatch,
            spread,
            profitPotential: calculateProfit(spread),
            category: categorizeMarket(polyMarket.title)
          })
        }
      }
    }

    // If no matches found, try with lower similarity threshold
    if (opportunities.length === 0) {
      console.log('No high-quality matches found, trying with lower threshold...')
      
      for (const polyMarket of validPolyMarkets.slice(0, 20)) {
        let bestMatch: Market | null = null
        let bestSimilarity = 0

        for (const secondaryMarket of secondaryMarkets) {
          if (matchedSecondary.has(secondaryMarket.id)) continue

          const similarity = calculateSimilarity(polyMarket.title, secondaryMarket.title)
          
          if (similarity > bestSimilarity && similarity > 0.2) {  // Lower threshold
            bestSimilarity = similarity
            bestMatch = secondaryMarket
          }
        }

        if (bestMatch) {
          matchedSecondary.add(bestMatch.id)
          const spread = calculateSpread(polyMarket, bestMatch)
          
          console.log(`Lower threshold match: "${polyMarket.title}" <-> "${bestMatch.title}" (similarity: ${bestSimilarity.toFixed(2)})`)
          
          opportunities.push({
            event: polyMarket.title,
            market1: polyMarket,
            market2: bestMatch,
            spread,
            profitPotential: calculateProfit(spread),
            category: categorizeMarket(polyMarket.title)
          })
          
          if (opportunities.length >= limit) break
        }
      }
    }
    
    // If still no matches, create demo pairs for visualization (Polymarket vs Kalshi)
    if (opportunities.length === 0) {
      console.log('No matching events found, creating demo pairs for visualization...')
      
      // For demo: pair top Polymarket markets with top Kalshi markets
      const demoPolyMarkets = validPolyMarkets.slice(0, limit)
      const demoKalshiMarkets = kalshiMarkets.filter(m => 
        m.yesPrice !== undefined && m.yesPrice !== null
      ).slice(0, limit)
      
      const maxPairs = Math.min(demoPolyMarkets.length, demoKalshiMarkets.length, limit)
      
      for (let i = 0; i < maxPairs; i++) {
        const polyMarket = demoPolyMarkets[i]
        const kalshiMarket = demoKalshiMarkets[i]
        
        const spread = calculateSpread(polyMarket, kalshiMarket)
        
        opportunities.push({
          event: `${polyMarket.title} (Polymarket) vs ${kalshiMarket.title} (Kalshi)`,
          market1: polyMarket,
          market2: kalshiMarket,
          spread,
          profitPotential: calculateProfit(spread),
          category: categorizeMarket(polyMarket.title)
        })
      }
      
      console.log(`Created ${opportunities.length} demo comparison pairs`)
    }

    // Sort by spread (highest first) and limit results
    opportunities.sort((a, b) => b.spread - a.spread)
    const topOpportunities = opportunities.slice(0, limit)

    return NextResponse.json({
      success: true,
      count: topOpportunities.length,
      opportunities: topOpportunities
    })
  } catch (error: any) {
    console.error('Error in arbitrage API:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch arbitrage opportunities',
      message: error.message || 'Unknown error',
      opportunities: []
    }, { status: 500 })
  }
}
