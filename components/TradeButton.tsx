'use client'

import { useState } from 'react'

interface TradeButtonProps {
  marketId: string
  platform: string
  onTrade?: (side: 'buy' | 'sell', amount: number) => void
}

export function TradeButton({ marketId, platform, onTrade }: TradeButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')

  const handleTrade = () => {
    const amountNum = parseFloat(amount)
    if (amountNum > 0) {
      onTrade?.(side, amountNum)
      setIsOpen(false)
      setAmount('')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Trade
      </button>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-blue-500">
      <h3 className="font-semibold mb-4">Place Trade</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-2 rounded ${
            side === 'buy' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-2 rounded ${
            side === 'sell' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-2">Amount ($)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="0.00"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleTrade}
          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Confirm
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 bg-gray-300 dark:bg-gray-700 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

