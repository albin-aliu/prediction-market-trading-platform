'use client'

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

interface ArbitrageCardProps {
  opportunity: ArbitrageOpportunity
}

export function ArbitrageCard({ opportunity }: ArbitrageCardProps) {
  const { event, market1, market2, spread, profitPotential, category, imageUrl } = opportunity
  
  // Market 1 is typically Polymarket, Market 2 is the comparison platform
  const polymarketMarket = market1
  const secondaryMarket = market2
  const secondaryPlatform = secondaryMarket?.platform || 'Other'

  const handleTrade = (platform: string, market: Market, side: 'yes' | 'no') => {
    alert(`${platform}: Buy ${side.toUpperCase()} on "${market.title}"`)
    // TODO: Implement actual trade execution
  }

  const getEventIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'politics': '🏛️',
      'sports': '⚽',
      'crypto': '₿',
      'economics': '📈',
      'entertainment': '🎬',
      'technology': '💻',
      'default': '📊'
    }
    return icons[category.toLowerCase()] || icons['default']
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all">
      {/* Market Image Header */}
      {polymarketMarket?.image && (
        <div className="relative w-full h-32 overflow-hidden">
          <img 
            src={polymarketMarket.image} 
            alt={event}
            className="w-full h-full object-cover blur-sm scale-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        </div>
      )}

      {/* Header with Event Info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{getEventIcon(category)}</div>
          <div className="flex-1">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-2">
              {category}
            </div>
            <h3 className="text-xl font-bold mb-2 line-clamp-2">{event}</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-green-500/30 backdrop-blur-sm px-3 py-1 rounded-full font-bold">
                💰 {(spread * 100).toFixed(1)}% Spread
              </div>
              <div className="bg-yellow-500/30 backdrop-blur-sm px-3 py-1 rounded-full font-bold">
                ⚡ ${profitPotential.toFixed(2)} Potential Profit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Markets */}
      <div className="grid md:grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
        {/* Polymarket Side */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <div>
              <h4 className="font-bold text-lg">Polymarket</h4>
              <p className="text-xs text-gray-500">Decentralized</p>
            </div>
          </div>

          {polymarketMarket ? (
            <>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">YES</p>
                    <p className="text-2xl font-bold text-green-600">
                      {polymarketMarket.yesPrice !== undefined && polymarketMarket.yesPrice !== null 
                        ? `${(polymarketMarket.yesPrice * 100).toFixed(1)}¢` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">NO</p>
                    <p className="text-2xl font-bold text-red-600">
                      {polymarketMarket.noPrice !== undefined && polymarketMarket.noPrice !== null
                        ? `${(polymarketMarket.noPrice * 100).toFixed(1)}¢` 
                        : polymarketMarket.yesPrice !== undefined && polymarketMarket.yesPrice !== null
                        ? `${((1 - polymarketMarket.yesPrice) * 100).toFixed(1)}¢` 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Volume 24h: ${polymarketMarket.volume_24h?.toLocaleString() || '0'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleTrade('Polymarket', polymarketMarket, 'yes')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Buy YES
                </button>
                <button
                  onClick={() => handleTrade('Polymarket', polymarketMarket, 'no')}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Buy NO
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Not available on Polymarket
            </div>
          )}
        </div>

        {/* Secondary Platform Side */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {secondaryPlatform.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-lg capitalize">{secondaryPlatform}</h4>
              <p className="text-xs text-gray-500">
                {secondaryPlatform === 'kalshi' ? 'CFTC Regulated' : 
                 secondaryPlatform === 'limitless' ? 'Multi-chain' : 'Decentralized'}
              </p>
            </div>
          </div>

          {secondaryMarket ? (
            <>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">YES</p>
                    <p className="text-2xl font-bold text-green-600">
                      {secondaryMarket.yesPrice !== undefined && secondaryMarket.yesPrice !== null 
                        ? `${(secondaryMarket.yesPrice * 100).toFixed(1)}¢` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">NO</p>
                    <p className="text-2xl font-bold text-red-600">
                      {secondaryMarket.noPrice !== undefined && secondaryMarket.noPrice !== null
                        ? `${(secondaryMarket.noPrice * 100).toFixed(1)}¢` 
                        : secondaryMarket.yesPrice !== undefined && secondaryMarket.yesPrice !== null
                        ? `${((1 - secondaryMarket.yesPrice) * 100).toFixed(1)}¢` 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Volume 24h: ${secondaryMarket.volume_24h?.toLocaleString() || '0'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleTrade(secondaryPlatform, secondaryMarket, 'yes')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Buy YES
                </button>
                <button
                  onClick={() => handleTrade(secondaryPlatform, secondaryMarket, 'no')}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Buy NO
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Not available on {secondaryPlatform}
            </div>
          )}
        </div>
      </div>

      {/* Arbitrage Strategy Hint */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-t border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          💡 <strong>Strategy:</strong> Buy on the platform with lower price, sell on the platform with higher price to capture the {(spread * 100).toFixed(1)}% spread
        </p>
      </div>
    </div>
  )
}

