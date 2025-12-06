'use client'

import { useAccount } from 'wagmi'

export default function PortfolioPage() {
  const { address, isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your wallet to view your portfolio and positions
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Portfolio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your positions and trading history
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Value</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Open Positions</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total P&L</div>
            <div className="text-2xl font-bold text-green-600">+$0.00</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">--%</div>
          </div>
        </div>

        {/* Positions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Open Positions
          </h2>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400">
              No open positions yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Start trading to see your positions here
            </p>
          </div>
        </div>

        {/* Wallet Info */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Wallet
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {address?.slice(2, 4).toUpperCase()}
            </div>
            <div>
              <div className="font-mono text-gray-900 dark:text-white">
                {address}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Connected via MetaMask
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

