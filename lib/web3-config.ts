/**
 * WEB3 CONFIGURATION
 * 
 * Configures wallet connections for Polymarket trading on Polygon
 * 
 * Networks:
 * - Polygon Mainnet (137) - Real money trading
 * - Polygon Mumbai Testnet (80001) - Free testing
 * 
 * Wallets Supported:
 * - MetaMask (injected)
 * - Coinbase Wallet (injected)  
 * - WalletConnect (mobile wallets)
 */

import { http, createConfig } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [polygon, polygonMumbai], // Mainnet and Testnet
  connectors: [
    injected({
      target: 'metaMask', // Only target MetaMask
    }),
  ],
  transports: {
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
  },
})

// ====== POLYGON MAINNET ADDRESSES ======
// USDC on Polygon (6 decimals)
export const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as `0x${string}`

// Polymarket Contracts
export const POLYMARKET_EXCHANGE = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E' as `0x${string}`
export const CTF_EXCHANGE = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E' as `0x${string}`

// Conditional Tokens Framework
export const CTF_ADDRESS = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045' as `0x${string}`

// ====== ERC20 ABI (for USDC approval) ======
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const
