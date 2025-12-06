'use client'

import { useState, useEffect } from 'react'
import { Market } from '@/lib/types'
import Link from 'next/link'

interface TradeModalProps {
  market: Market
  onClose: () => void
}

export function TradeModal({ market, onClose }: TradeModalProps) {
  const [side, setSide] = useState<'yes' | 'no'>('yes')
  const [dollarAmount, setDollarAmount] = useState('10')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [botConfigured, setBotConfigured] = useState(false)

  // Check if trading bot is configured
  useEffect(() => {
    const key = localStorage.getItem('polymarket_bot_key')
    setBotConfigured(!!key)
  }, [])

  const price = side === 'yes' ? (market.yesPrice || 0.5) : (market.noPrice || 0.5)
  const cost = parseFloat(dollarAmount) || 0 // User's dollar input IS the cost
  const shares = cost / price // Calculate shares from dollar amount
  const potentialPayout = shares * 1 // Each share pays $1 if correct
  const potentialProfit = potentialPayout - cost
  const returnPercentage = cost > 0 ? ((potentialProfit / cost) * 100).toFixed(0) : '0'

  const formatPrice = (p: number) => `${Math.round(p * 100)}¢`
  const formatVolume = (v: number | undefined) => {
    if (!v) return '$0'
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`
    return `$${v.toFixed(0)}`
  }
  
  // Format number with commas for readability (e.g., 1000 -> 1,000)
  const formatNumber = (n: number, decimals = 2) => {
    return n.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })
  }
  
  // Format currency with commas
  const formatCurrency = (n: number) => {
    return '$' + n.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }

  const handleTrade = async () => {
    const privateKey = localStorage.getItem('polymarket_bot_key')
    
    if (!privateKey) {
      setStatus('❌ Please configure your trading bot first')
      return
    }

    setLoading(true)
    setStatus('Placing order...')

    try {
      // Get the token ID for the selected side
      const tokenId = side === 'yes' ? market.yesTokenId : market.noTokenId
      
      if (!tokenId) {
        setStatus('❌ Token ID not available for this market')
        setLoading(false)
        return
      }
      
      const response = await fetch('/api/bot/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'place_order',
          privateKey,
          tokenId,
          side: 'BUY',
          size: shares.toString(),
          price: price.toString()
        })
      })

      const result = await response.json()
      console.log('Trade result:', result)

      if (result.success) {
        setStatus('✅ Order placed successfully!')
        setTimeout(() => onClose(), 2000)
      } else {
        setStatus(`❌ ${result.message}`)
      }
    } catch (error: any) {
      console.error('Trade error:', error)
      setStatus(`❌ ${error.message || 'Order failed'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {market.title}
              </h2>
              <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Volume: {formatVolume(market.volume_24h)}</span>
                <span>•</span>
                <span className="text-purple-600 dark:text-purple-400">{market.platform}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Current Prices */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
              <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">YES</div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatPrice(market.yesPrice || 0.5)}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
              <div className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">NO</div>
              <div className="text-3xl font-bold text-red-700 dark:text-red-300">
                {formatPrice(market.noPrice || 0.5)}
              </div>
            </div>
          </div>
        </div>

        {/* Trade Form */}
        <div className="p-6">
          {/* Side Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose Outcome
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSide('yes')}
                className={`py-3 rounded-xl font-semibold text-lg transition-all ${
                  side === 'yes'
                    ? 'bg-green-600 text-white shadow-lg scale-[1.02]'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Buy YES
              </button>
              <button
                onClick={() => setSide('no')}
                className={`py-3 rounded-xl font-semibold text-lg transition-all ${
                  side === 'no'
                    ? 'bg-red-600 text-white shadow-lg scale-[1.02]'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Buy NO
              </button>
            </div>
          </div>

          {/* Amount - Dollar Based */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount to Invest
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-500 dark:text-gray-400 font-semibold">$</span>
              <input
                type="number"
                value={dollarAmount}
                onChange={(e) => setDollarAmount(e.target.value)}
                min="1"
                step="1"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[5, 10, 25, 50, 100].map(preset => (
                <button
                  key={preset}
                  onClick={() => setDollarAmount(preset.toString())}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    dollarAmount === preset.toString()
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6">
            <div className="space-y-3 text-sm">
              {/* Your Investment */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Your Investment</span>
                <span className="font-bold text-xl text-gray-900 dark:text-white">{formatCurrency(cost)}</span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span>Price per share</span>
                  <span>{formatPrice(price)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Shares you&apos;ll receive</span>
                  <span>{formatNumber(shares)} shares</span>
                </div>
              </div>

              {/* Potential Win */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div>
                    <div className="text-xs text-green-600 dark:text-green-400">If {side.toUpperCase()} wins</div>
                    <div className="font-bold text-green-700 dark:text-green-300">You get {formatCurrency(potentialPayout)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 dark:text-green-400">Profit</div>
                    <div className="font-bold text-green-700 dark:text-green-300">+{formatCurrency(potentialProfit)} ({returnPercentage}%)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              status.startsWith('✅') ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
              status.startsWith('❌') ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            }`}>
              {status}
            </div>
          )}

          {/* Action Buttons */}
          {!botConfigured ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                🤖 Trading Bot Required
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 mb-3">
                Configure your trading wallet to place orders
              </p>
              <Link
                href="/bot"
                className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Setup Trading Bot →
              </Link>
            </div>
          ) : (
            <button
              onClick={handleTrade}
              disabled={loading || cost <= 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                side === 'yes'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading ? '⏳ Placing Order...' : `Buy ${side.toUpperCase()} for ${formatCurrency(cost)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

