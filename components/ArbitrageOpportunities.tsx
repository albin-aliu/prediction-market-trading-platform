'use client'

import { useState, useEffect } from 'react'
import { ArbitrageCard } from './ArbitrageCard'
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

export function ArbitrageOpportunities() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/arbitrage?limit=5')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch arbitrage opportunities')
      }

      setOpportunities(data.opportunities || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching arbitrage opportunities:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-6 text-xl text-gray-600 dark:text-gray-400">
          Scanning markets for arbitrage opportunities...
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          Comparing prices across Polymarket and Kalshi
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">⚠️</div>
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-bold text-xl mb-2">
                Error Loading Arbitrage Opportunities
              </h3>
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchOpportunities}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    )
  }

  if (opportunities.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-3">No Arbitrage Opportunities Found</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Markets are currently in sync. Check back later for price discrepancies.
          </p>
          <button 
            onClick={fetchOpportunities}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            ⚡ Live Arbitrage Opportunities
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Found {opportunities.length} opportunity{opportunities.length !== 1 ? 'ies' : ''} with price discrepancies
          </p>
        </div>
        <button 
          onClick={fetchOpportunities}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-500 p-6 rounded-lg mb-8">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h4 className="font-bold text-lg mb-2">How Arbitrage Works</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              When the same event has different prices on Polymarket and Kalshi, you can profit by buying low on one platform and selling high on the other. 
              The spread represents your potential profit per share.
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
              <strong>Note:</strong> Currently showing side-by-side comparison for demonstration. 
              In production, only matching events with true arbitrage opportunities would be displayed.
            </p>
          </div>
        </div>
      </div>

      {/* Arbitrage Cards */}
      <div className="space-y-8">
        {opportunities.map((opportunity, index) => (
          <ArbitrageCard key={index} opportunity={opportunity} />
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 text-center">
          <div className="text-3xl font-bold mb-2">
            {opportunities.length}
          </div>
          <div className="text-sm opacity-90">Active Opportunities</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 text-center">
          <div className="text-3xl font-bold mb-2">
            {opportunities.length > 0 ? (Math.max(...opportunities.map(o => o.spread)) * 100).toFixed(1) : '0'}%
          </div>
          <div className="text-sm opacity-90">Highest Spread</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 text-center">
          <div className="text-3xl font-bold mb-2">
            ${opportunities.length > 0 ? opportunities.reduce((sum, o) => sum + o.profitPotential, 0).toFixed(2) : '0'}
          </div>
          <div className="text-sm opacity-90">Total Profit Potential</div>
        </div>
      </div>
    </div>
  )
}

