'use client'

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { formatUnits } from 'viem'
import { USDC_ADDRESS } from '@/lib/web3-config'
import { polygon } from 'wagmi/chains'

export function WalletConnect() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
    chainId: polygon.id,
  })

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3 bg-gray-800 px-4 py-2 rounded-lg">
        <div className="text-sm">
          <p className="font-semibold text-blue-400">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          {chainId === polygon.id && usdcBalance && (
            <p className="text-xs text-gray-300">
              ${formatUnits(usdcBalance.value, usdcBalance.decimals).slice(0, 8)} USDC
            </p>
          )}
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div>
      {connectors.map(connector => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
        >
          Connect Wallet
        </button>
      ))}
    </div>
  )
}
