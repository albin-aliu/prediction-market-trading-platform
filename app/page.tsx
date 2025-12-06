'use client'

import { useState, useEffect, useMemo } from 'react'
import { Market } from '@/lib/types'
import { TradeModal } from '@/components/TradeModal'

// Category filters with keywords for detection
const CATEGORIES = [
  { id: 'all', label: 'All Markets', icon: '🌐', keywords: [] },
  { id: 'politics', label: 'Politics', icon: '🏛️', keywords: ['trump', 'biden', 'election', 'president', 'congress', 'senate', 'democrat', 'republican', 'governor', 'vote', 'poll', 'cabinet', 'impeach', 'politician', 'party', 'gop', 'white house', 'supreme court', 'legislation'] },
  { id: 'sports', label: 'Sports', icon: '🏈', keywords: ['nfl', 'nba', 'mlb', 'nhl', 'super bowl', 'world series', 'championship', 'playoff', 'mvp', 'quarterback', 'lebron', 'football', 'basketball', 'baseball', 'hockey', 'soccer', 'ufc', 'boxing', 'tennis', 'golf', 'olympics', 'world cup', 'fifa', 'espn', 'coach', 'team', 'player'] },
  { id: 'crypto', label: 'Crypto', icon: '₿', keywords: ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'solana', 'sol', 'dogecoin', 'doge', 'altcoin', 'defi', 'nft', 'blockchain', 'binance', 'coinbase', 'token', 'mining', 'halving', 'satoshi', 'web3'] },
  { id: 'finance', label: 'Finance', icon: '📈', keywords: ['stock', 'market', 'fed', 'interest rate', 'inflation', 'gdp', 'economy', 'recession', 'nasdaq', 's&p', 'dow', 'treasury', 'bond', 'ipo', 'earnings', 'revenue', 'profit', 'bank', 'wall street', 'investor', 'trading'] },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', keywords: ['movie', 'film', 'oscar', 'grammy', 'emmy', 'netflix', 'disney', 'spotify', 'youtube', 'tiktok', 'celebrity', 'actor', 'actress', 'singer', 'album', 'concert', 'taylor swift', 'kardashian', 'kanye', 'box office', 'streaming'] },
  { id: 'tech', label: 'Tech', icon: '💻', keywords: ['apple', 'google', 'microsoft', 'amazon', 'meta', 'facebook', 'twitter', 'x.com', 'elon', 'musk', 'tesla', 'spacex', 'ai', 'artificial intelligence', 'openai', 'chatgpt', 'iphone', 'android', 'software', 'startup', 'silicon valley'] },
  { id: 'world', label: 'World', icon: '🌍', keywords: ['ukraine', 'russia', 'china', 'war', 'nato', 'eu', 'europe', 'asia', 'middle east', 'israel', 'iran', 'india', 'climate', 'un', 'united nations', 'treaty', 'sanctions', 'military', 'nuclear'] },
]

// Function to detect category from market title
function detectCategory(title: string): string {
  const lowerTitle = title.toLowerCase()
  
  for (const category of CATEGORIES) {
    if (category.id === 'all') continue
    for (const keyword of category.keywords) {
      if (lowerTitle.includes(keyword)) {
        return category.id
      }
    }
  }
  return 'other'
}

// Shuffle array function
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [showTradeModal, setShowTradeModal] = useState(false)

  useEffect(() => {
    fetchMarkets()
  }, [])

  const fetchMarkets = async () => {
    try {
      // Fetch lots of markets to get more balanced odds
      const response = await fetch('/api/markets?status=open&limit=500')
      const data = await response.json()
      
      // Only filter out markets that are essentially decided (0-1% or 99-100%)
      const validMarkets = (data.markets || []).filter((market: Market) => {
        const yesPrice = market.yesPrice || 0.5
        return yesPrice >= 0.01 && yesPrice <= 0.99
      })
      
      // Sort by how balanced the odds are (50/50 = most balanced, 1/99 = least balanced)
      // Markets closer to 50% appear first, extreme odds appear last
      const sortedMarkets = validMarkets.sort((a: Market, b: Market) => {
        const aBalance = Math.abs(0.5 - (a.yesPrice || 0.5)) // 0 = perfectly balanced
        const bBalance = Math.abs(0.5 - (b.yesPrice || 0.5))
        return aBalance - bBalance // Lower (more balanced) first
      })
      
      // Shuffle within balance tiers to add variety
      // Group into tiers: very balanced (0-15%), moderate (15-35%), extreme (35%+)
      const veryBalanced = sortedMarkets.filter((m: Market) => Math.abs(0.5 - (m.yesPrice || 0.5)) <= 0.15)
      const moderate = sortedMarkets.filter((m: Market) => {
        const balance = Math.abs(0.5 - (m.yesPrice || 0.5))
        return balance > 0.15 && balance <= 0.35
      })
      const extreme = sortedMarkets.filter((m: Market) => Math.abs(0.5 - (m.yesPrice || 0.5)) > 0.35)
      
      // Shuffle each tier and combine
      setMarkets([
        ...shuffleArray(veryBalanced),
        ...shuffleArray(moderate),
        ...shuffleArray(extreme)
      ])
    } catch (error) {
      console.error('Error fetching markets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Categorize and filter markets
  const categorizedMarkets = useMemo(() => {
    return markets.map(market => ({
      ...market,
      detectedCategory: detectCategory(market.title)
    }))
  }, [markets])

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: categorizedMarkets.length }
    for (const market of categorizedMarkets) {
      counts[market.detectedCategory] = (counts[market.detectedCategory] || 0) + 1
    }
    return counts
  }, [categorizedMarkets])

  // Filter markets by search and category
  const filteredMarkets = useMemo(() => {
    return categorizedMarkets.filter(market => {
      const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || market.detectedCategory === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [categorizedMarkets, searchQuery, selectedCategory])

  const handleTradeClick = (market: Market) => {
    setSelectedMarket(market)
    setShowTradeModal(true)
  }

  const formatVolume = (volume: number | undefined) => {
    if (!volume) return '$0'
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`
    return `$${volume.toFixed(0)}`
  }

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '50¢'
    return `${Math.round(price * 100)}¢`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Markets
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Browse prediction markets and place trades
              </p>
            </div>
            <button
              onClick={() => setMarkets(shuffleArray([...markets]))}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              🎲 Shuffle
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-xl px-4 py-3 pl-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Categories */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-20">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Categories
              </h2>
              <nav className="space-y-1">
                {CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>
                      <span className="mr-2">{category.icon}</span>
                      {category.label}
                    </span>
                    {categoryCounts[category.id] > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedCategory === category.id
                          ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {categoryCounts[category.id]}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Stats */}
              <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                  Platform Stats
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Markets</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{markets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Platform</span>
                    <span className="font-semibold text-purple-600">Polymarket</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Markets Grid */}
          <main className="flex-1">
            {/* Mobile Category Tabs */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <span>{category.icon} {category.label}</span>
                  {categoryCounts[category.id] > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {categoryCounts[category.id]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Markets Grid */}
            {!loading && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMarkets.map(market => {
                  // Get category info for badge
                  const categoryInfo = CATEGORIES.find(c => c.id === market.detectedCategory) || 
                    { icon: '📋', label: 'Other', id: 'other' }
                  
                  return (
                  <div
                    key={market.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleTradeClick(market)}
                  >
                    {/* Market Image */}
                    {market.image && (
                      <div className="h-32 bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                        <img 
                          src={market.image} 
                          alt={market.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {/* Category Badge */}
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                          {categoryInfo.icon} {categoryInfo.label}
                        </div>
                      </div>
                    )}
                    
                    {/* Show badge below if no image */}
                    {!market.image && (
                      <div className="px-4 pt-4">
                        <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400 font-medium">
                          {categoryInfo.icon} {categoryInfo.label}
                        </span>
                      </div>
                    )}
                    
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {market.title}
                      </h3>

                      {/* Prices */}
                      <div className="flex gap-3 mb-3">
                        <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">YES</div>
                          <div className="text-lg font-bold text-green-700 dark:text-green-300">
                            {formatPrice(market.yesPrice)}
                          </div>
                        </div>
                        <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
                          <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">NO</div>
                          <div className="text-lg font-bold text-red-700 dark:text-red-300">
                            {formatPrice(market.noPrice)}
                          </div>
                        </div>
                      </div>

                      {/* Volume & Trade Button */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">{formatVolume(market.volume_24h)}</span> volume
                        </div>
                        <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                          Trade
                        </button>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            )}

            {/* No Results */}
            {!loading && filteredMarkets.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No markets found matching your criteria
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && selectedMarket && (
        <TradeModal
          market={selectedMarket}
          onClose={() => setShowTradeModal(false)}
        />
      )}
    </div>
  )
}
