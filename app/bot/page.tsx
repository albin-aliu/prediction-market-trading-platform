'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function BotPage() {
  const [privateKey, setPrivateKey] = useState('')
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [balance, setBalance] = useState<{ usdc: string; matic: string } | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  // Check if key is already saved
  useEffect(() => {
    const stored = localStorage.getItem('polymarket_bot_key')
    if (stored) {
      setSavedKey('********' + stored.slice(-8))
      fetchWalletInfo(stored)
    }
  }, [])

  const fetchWalletInfo = async (key: string) => {
    try {
      const response = await fetch('/api/bot/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privateKey: key })
      })
      const data = await response.json()
      if (data.success) {
        setWalletAddress(data.address)
        setBalance(data.balance)
      }
    } catch (error) {
      console.error('Error fetching wallet info:', error)
    }
  }

  const handleSaveKey = async () => {
    if (!privateKey || privateKey.length < 64) {
      setStatus('❌ Invalid private key format')
      return
    }

    setLoading(true)
    setStatus('Validating key...')

    try {
      // Validate the key by checking if we can derive an address
      const response = await fetch('/api/bot/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privateKey })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Store in localStorage (in production, use more secure storage)
        localStorage.setItem('polymarket_bot_key', privateKey)
        setSavedKey('********' + privateKey.slice(-8))
        setWalletAddress(data.address)
        setBalance(data.balance)
        setPrivateKey('')
        setStatus('✅ Trading bot configured!')
      } else {
        setStatus(`❌ ${data.message}`)
      }
    } catch (error) {
      setStatus('❌ Failed to validate key')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveKey = () => {
    localStorage.removeItem('polymarket_bot_key')
    setSavedKey(null)
    setWalletAddress(null)
    setBalance(null)
    setStatus('Key removed')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Markets
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🤖 Trading Bot Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure your trading bot with a dedicated wallet for automated trading.
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Security Warning
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Use a <strong>dedicated trading wallet</strong>, NOT your main wallet</li>
            <li>• Only deposit what you're willing to trade</li>
            <li>• Private key is stored locally in your browser</li>
            <li>• Never share your private key with anyone</li>
          </ul>
        </div>

        {/* Current Status */}
        {savedKey ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ✅ Bot Configured
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Private Key</label>
                <div className="font-mono text-gray-900 dark:text-white">{savedKey}</div>
              </div>
              
              {walletAddress && (
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Wallet Address</label>
                  <div className="font-mono text-gray-900 dark:text-white text-sm break-all">
                    {walletAddress}
                  </div>
                </div>
              )}
              
              {balance && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">USDC Balance</label>
                    <div className="text-2xl font-bold text-green-600">${balance.usdc}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">POL (Gas)</label>
                    <div className="text-2xl font-bold text-purple-600">{balance.matic}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Link 
                  href="/"
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-center"
                >
                  Start Trading →
                </Link>
                <button
                  onClick={handleRemoveKey}
                  className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium"
                >
                  Remove Key
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Configure Trading Wallet
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Private Key
                </label>
                <input
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter your trading wallet private key"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  64 character hex string (with or without 0x prefix)
                </p>
              </div>

              {status && (
                <div className={`p-3 rounded-lg text-sm ${
                  status.startsWith('✅') ? 'bg-green-100 text-green-700' :
                  status.startsWith('❌') ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {status}
                </div>
              )}

              <button
                onClick={handleSaveKey}
                disabled={loading || !privateKey}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-bold"
              >
                {loading ? 'Validating...' : 'Configure Bot'}
              </button>
            </div>
          </div>
        )}

        {/* How to get a trading wallet */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📝 How to Create a Trading Wallet
          </h2>
          
          <ol className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">1.</span>
              <span>Open MetaMask and create a <strong>new account</strong> (dedicated for trading)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">2.</span>
              <span>Click the three dots → Account Details → Show Private Key</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">3.</span>
              <span>Copy the private key and paste it above</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">4.</span>
              <span>Send USDC and a small amount of POL to this wallet on Polygon</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600">5.</span>
              <span>Start trading! 🚀</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}

