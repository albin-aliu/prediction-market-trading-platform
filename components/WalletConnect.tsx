/**
 * WALLET CONNECT COMPONENT
 * 
 * Handles wallet connection/disconnection and displays:
 * - Wallet address
 * - USDC balance
 * - Network status (Polygon Mainnet or Mumbai Testnet)
 * - Network switching
 */

'use client'

import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { formatUnits } from 'viem'
import { USDC_ADDRESS } from '@/lib/web3-config'
import { polygon, polygonMumbai } from 'wagmi/chains'

export function WalletConnect() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  // Get USDC balance (Polygon Mainnet)
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
    chainId: polygon.id,
  })

  // Get MATIC balance for gas
  const { data: maticBalance } = useBalance({
    address,
    chainId,
  })

  if (isConnected && address) {
    const isPolygon = chainId === polygon.id
    const isTestnet = chainId === polygonMumbai.id
    const isWrongNetwork = !isPolygon && !isTestnet

    return (
      <div className="flex items-center gap-3">
        {/* Network Badge */}
        <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
          isPolygon ? 'bg-purple-600 text-white' :
          isTestnet ? 'bg-yellow-600 text-white' :
          'bg-red-600 text-white'
        }`}>
          {isPolygon ? '🟣 Polygon' : isTestnet ? '🧪 Mumbai' : '⚠️ Wrong Network'}
        </div>

        {/* Wallet Info */}
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            {/* Address */}
            <span className="font-mono text-sm font-semibold">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            
            {/* Balances */}
            <div className="border-l border-gray-300 dark:border-gray-600 pl-2 text-xs">
              {isPolygon && usdcBalance && (
                <div className="text-green-600 dark:text-green-400 font-semibold">
                  ${formatUnits(usdcBalance.value, 6).slice(0, 8)} USDC
                </div>
              )}
              {maticBalance && (
                <div className="text-gray-600 dark:text-gray-400">
                  {formatUnits(maticBalance.value, 18).slice(0, 6)} MATIC
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Network Switch Button */}
        {isWrongNetwork && switchChain && (
          <button
            onClick={() => switchChain({ chainId: polygon.id })}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Switch to Polygon
          </button>
        )}

        {/* Disconnect Button */}
        <button
          onClick={() => disconnect()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
        >
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  )
}
