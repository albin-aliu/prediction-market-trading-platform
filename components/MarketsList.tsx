'use client'

import { useState, useEffect } from 'react'
import { Market } from '@/lib/types'

export function MarketsList() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('open')

  useEffect(() => {
    fetchMarkets()
  }, [selectedPlatform, selectedStatus])

  const fetchMarkets = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (selectedPlatform) params.append('platform', selectedPlatform)
      if (selectedStatus) params.append('status', selectedStatus)
      params.append('limit', '20')

      const response = await fetch(`/api/markets?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch markets')
      }

      setMarkets(data.markets || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching markets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTrade = async (marketId: string, side: 'buy' | 'sell', outcome: 'yes' | 'no') => {
    try {
      // TODO: Implement actual trade execution
      alert(`Trade initiated: ${side.toUpperCase()} ${outcome.toUpperCase()} on market ${marketId}`)
      
      // This will be replaced with actual API call
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ marketId, side, outcome, amount: 100 })
      // })
    } catch (err) {
      console.error('Trade error:', err)
      alert('Failed to execute trade')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading markets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error Loading Markets</h3>
        <p className="text-red-600 dark:text-red-300">{error}</p>
        <p className="text-sm text-red-500 dark:text-red-400 mt-2">
          Make sure you've set your POLYROUTER_API_KEY in the .env file
        </p>
        <button 
          onClick={fetchMarkets}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (markets.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 text-lg">No markets found</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        <select 
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Platforms</option>
          <option value="polymarket">Polymarket</option>
          <option value="kalshi">Kalshi</option>
          <option value="manifold">Manifold</option>
          <option value="limitless">Limitless</option>
        </select>
        
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="resolved">Resolved</option>
        </select>

        <button
          onClick={fetchMarkets}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Markets Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {markets.map((market) => (
          <div
            key={market.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
          >
            {/* Market Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {market.title}
                </h3>
                <span className="inline-block text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                  {market.platform}
                </span>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                market.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                market.status === 'closed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {market.status.toUpperCase()}
              </span>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">YES Price</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {market.yesPrice ? `${(market.yesPrice * 100).toFixed(1)}¢` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Volume 24h</p>
                <p className="text-lg font-semibold">
                  ${market.volume_24h ? market.volume_24h.toLocaleString() : '0'}
                </p>
              </div>
            </div>

            {/* Trading Buttons */}
            {market.status === 'open' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleTrade(market.id, 'buy', 'yes')}
                  className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Buy YES
                </button>
                <button
                  onClick={() => handleTrade(market.id, 'buy', 'no')}
                  className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Buy NO
                </button>
              </div>
            )}

            {market.status !== 'open' && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-3">
                Market is {market.status}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Market Count */}
      <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
        Showing {markets.length} market{markets.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

