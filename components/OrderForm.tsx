'use client'

import { useState, useEffect } from 'react'
// import { useAccount } from 'wagmi'
import { Market } from '@/lib/types'
// import { approveUSDC, placeOrder } from '@/lib/simple-trading'

interface OrderFormProps {
  preselectedMarket?: Market
  preselectedSide?: 'yes' | 'no'
}

export function OrderForm({ preselectedMarket, preselectedSide }: OrderFormProps) {
  // Temporarily disabled - Web3 integration coming soon
  const address: string | undefined = undefined
  const isConnected = false
  const [markets, setMarkets] = useState<Market[]>([])
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(preselectedMarket || null)
  const [orderSide, setOrderSide] = useState<'yes' | 'no'>(preselectedSide || 'yes')
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [amount, setAmount] = useState<string>('10')
  const [limitPrice, setLimitPrice] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [approving, setApproving] = useState(false)
  const [txHash, setTxHash] = useState<string>('')

  useEffect(() => {
    if (!preselectedMarket) {
      fetchMarkets()
    }
  }, [preselectedMarket])

  const fetchMarkets = async () => {
    try {
      const response = await fetch('/api/markets?status=open&limit=20')
      const data = await response.json()
      setMarkets(data.markets || [])
      if (data.markets?.length > 0 && !selectedMarket) {
        setSelectedMarket(data.markets[0])
      }
    } catch (error) {
      console.error('Error fetching markets:', error)
    }
  }

  const calculateOrderDetails = () => {
    if (!selectedMarket || !amount) return null

    const shares = parseFloat(amount)
    const price = orderType === 'market' 
      ? (orderSide === 'yes' ? selectedMarket.yesPrice || 0.5 : selectedMarket.noPrice || 0.5)
      : parseFloat(limitPrice) / 100

    const cost = shares * price
    const platformFee = cost * 0.02 // 2% fee estimate
    const totalCost = cost + platformFee
    const maxProfit = shares * (1 - price)
    const maxLoss = cost

    return {
      shares,
      price: price * 100, // Convert back to cents
      cost,
      platformFee,
      totalCost,
      maxProfit,
      maxLoss,
      roi: ((maxProfit / totalCost) * 100).toFixed(1)
    }
  }

  const handleSubmitOrder = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first!')
      return
    }

    if (!selectedMarket) {
      alert('Please select a market')
      return
    }

    setLoading(true)
    
    try {
      const orderDetails = calculateOrderDetails()
      if (!orderDetails) {
        throw new Error('Invalid order details')
      }

      // Step 1: Approve USDC (if needed) - DEMO MODE
      setApproving(true)
      // const approvalHash = await approveUSDC(orderDetails.totalCost.toString())
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate approval
      console.log('DEMO: USDC approved')
      setApproving(false)

      // Step 2: Place order - DEMO MODE
      const result = {
        success: true,
        message: 'Demo order placed successfully',
        txHash: '0x' + Math.random().toString(16).substring(2, 66)
      }

      if (result.success) {
        setTxHash(result.txHash || '')
        alert(
          `✅ ORDER PLACED!\n\n` +
          `Market: ${selectedMarket.title}\n` +
          `Side: ${orderSide.toUpperCase()}\n` +
          `Shares: ${orderDetails.shares}\n` +
          `Total Cost: $${orderDetails.totalCost.toFixed(2)}\n` +
          `Transaction: ${result.txHash?.slice(0, 10)}...`
        )
        setShowConfirmation(false)
        setAmount('10')
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Order failed:', error)
      alert(`❌ Order failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      setApproving(false)
    }
  }

  const orderDetails = calculateOrderDetails()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-2xl font-bold mb-6">Place Order</h3>

          {/* Market Selection */}
          {!preselectedMarket && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Select Market</label>
              <select
                value={selectedMarket?.id || ''}
                onChange={(e) => {
                  const market = markets.find(m => m.id === e.target.value)
                  setSelectedMarket(market || null)
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
              >
                {markets.map(market => (
                  <option key={market.id} value={market.id}>
                    {market.title.substring(0, 60)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          {preselectedMarket && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Selected Market:</p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{selectedMarket?.title}</p>
            </div>
          )}

          {/* Order Side */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3">Buy Position</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderSide('yes')}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  orderSide === 'yes'
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                YES
              </button>
              <button
                onClick={() => setOrderSide('no')}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  orderSide === 'no'
                    ? 'bg-red-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                NO
              </button>
            </div>
          </div>

          {/* Order Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3">Order Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderType('market')}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  orderType === 'market'
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                  orderType === 'limit'
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Limit
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Number of Shares</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none text-lg font-semibold"
              placeholder="Enter shares"
            />
            <div className="flex gap-2 mt-2">
              {[10, 25, 50, 100].map(preset => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className="flex-1 py-2 px-3 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Limit Price */}
          {orderType === 'limit' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Limit Price (cents)</label>
              <input
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                min="0.1"
                max="99.9"
                step="0.1"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none text-lg font-semibold"
                placeholder="Enter price in cents"
              />
            </div>
          )}

          {/* Submit Button */}
          {!isConnected ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 text-center">
              <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                🔒 Connect your wallet to place real orders
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                Click "Connect Wallet" in the navigation bar
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={!selectedMarket || !amount || (orderType === 'limit' && !limitPrice)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Review Order
            </button>
          )}
        </div>

        {/* Order Preview */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-2xl font-bold mb-6">Order Preview</h3>

          {orderDetails && selectedMarket ? (
            <div className="space-y-4">
              {/* Current Market Price */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Market Price</p>
                <p className="text-3xl font-bold">
                  {orderSide === 'yes' 
                    ? `${((selectedMarket.yesPrice || 0.5) * 100).toFixed(1)}¢`
                    : `${((selectedMarket.noPrice || 0.5) * 100).toFixed(1)}¢`}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Shares</span>
                  <span className="font-bold">{orderDetails.shares}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Price per Share</span>
                  <span className="font-bold">{orderDetails.price.toFixed(1)}¢</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-bold">${orderDetails.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Platform Fee (2%)</span>
                  <span className="font-bold text-orange-600">${orderDetails.platformFee.toFixed(2)}</span>
                </div>
                
                <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Cost</span>
                    <span className="text-2xl font-bold text-blue-600">${orderDetails.totalCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Profit/Loss Potential */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 mt-6">
                <p className="text-sm font-semibold mb-3">Potential Outcomes</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700 dark:text-green-300">Max Profit</span>
                    <span className="font-bold text-green-700 dark:text-green-300">
                      ${orderDetails.maxProfit.toFixed(2)} (+{orderDetails.roi}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-red-700 dark:text-red-300">Max Loss</span>
                    <span className="font-bold text-red-700 dark:text-red-300">
                      -${orderDetails.maxLoss.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Market Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-4">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Platform:</strong> {selectedMarket.platform}<br/>
                  <strong>Volume 24h:</strong> ${selectedMarket.volume_24h?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              Fill in the order form to see preview
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && orderDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold mb-4">Confirm Order</h3>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">You are about to buy:</p>
              <p className="text-xl font-bold mb-1">
                {orderDetails.shares} shares of {orderSide.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                on "{selectedMarket?.title?.substring(0, 80)}..."
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span>Total Cost:</span>
                <span className="font-bold text-xl">${orderDetails.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">Potential Profit:</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  ${orderDetails.maxProfit.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={loading || approving}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={loading || approving}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approving ? '⏳ Approving USDC...' : loading ? '📤 Placing Order...' : '✅ Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

