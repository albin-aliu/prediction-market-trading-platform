/**
 * POLYMARKET TRADING SERVICE
 * 
 * Handles real order placement on Polymarket via their CLOB API.
 * 
 * How Polymarket trading works:
 * 1. User connects wallet (MetaMask)
 * 2. User approves USDC spending (one-time)
 * 3. User signs an EIP-712 order message
 * 4. Order is submitted to Polymarket CLOB
 * 5. CLOB matches orders and executes on Polygon
 */

import { getWalletClient, getPublicClient } from '@wagmi/core'
import { config, USDC_ADDRESS, POLYMARKET_EXCHANGE } from './web3-config'
import { parseUnits, formatUnits } from 'viem'

// Polymarket CLOB API endpoints
const CLOB_API = 'https://clob.polymarket.com'
const GAMMA_API = 'https://gamma-api.polymarket.com'

// Order side types
export type OrderSide = 'BUY' | 'SELL'
export type TokenSide = 'YES' | 'NO'

// Order types
export interface PolymarketOrder {
  tokenId: string       // The token ID for YES or NO outcome
  side: OrderSide       // BUY or SELL
  size: number          // Number of shares
  price: number         // Price in USDC (0.01 to 0.99)
}

export interface OrderResult {
  success: boolean
  orderId?: string
  message: string
  txHash?: string
}

export interface MarketTokens {
  questionId: string
  yesTokenId: string
  noTokenId: string
}

/**
 * Get the token IDs for a market's YES and NO outcomes
 * Uses server-side API to avoid CORS issues
 */
export async function getMarketTokens(conditionId: string): Promise<MarketTokens | null> {
  try {
    // Call our server API to fetch tokens (avoids CORS)
    const response = await fetch('/api/trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_market_tokens',
        conditionId
      })
    })
    
    const data = await response.json()
    
    if (!data.success) {
      console.error('Failed to fetch market tokens:', data.message)
      return null
    }
    
    return data.tokens
  } catch (error) {
    console.error('Error fetching market tokens:', error)
    return null
  }
}

/**
 * Get the order book for a specific token
 */
export async function getOrderBook(tokenId: string): Promise<{
  bids: Array<{ price: number; size: number }>
  asks: Array<{ price: number; size: number }>
} | null> {
  try {
    const response = await fetch(`${CLOB_API}/book?token_id=${tokenId}`)
    
    if (!response.ok) {
      console.error('Failed to fetch order book')
      return null
    }
    
    const data = await response.json()
    return {
      bids: data.bids || [],
      asks: data.asks || []
    }
  } catch (error) {
    console.error('Error fetching order book:', error)
    return null
  }
}

/**
 * Get the best available price for a market order
 */
export async function getBestPrice(tokenId: string, side: OrderSide): Promise<number | null> {
  const orderBook = await getOrderBook(tokenId)
  if (!orderBook) return null
  
  if (side === 'BUY') {
    // Best ask (lowest sell price)
    const bestAsk = orderBook.asks[0]
    return bestAsk ? bestAsk.price : null
  } else {
    // Best bid (highest buy price)
    const bestBid = orderBook.bids[0]
    return bestBid ? bestBid.price : null
  }
}

/**
 * Create the EIP-712 domain for order signing
 */
function getOrderDomain() {
  return {
    name: 'Polymarket CTF Exchange',
    version: '1',
    chainId: 137, // Polygon Mainnet
    verifyingContract: POLYMARKET_EXCHANGE
  } as const
}

/**
 * Create the EIP-712 order types
 */
const ORDER_TYPES = {
  Order: [
    { name: 'salt', type: 'uint256' },
    { name: 'maker', type: 'address' },
    { name: 'signer', type: 'address' },
    { name: 'taker', type: 'address' },
    { name: 'tokenId', type: 'uint256' },
    { name: 'makerAmount', type: 'uint256' },
    { name: 'takerAmount', type: 'uint256' },
    { name: 'expiration', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'feeRateBps', type: 'uint256' },
    { name: 'side', type: 'uint8' },
    { name: 'signatureType', type: 'uint8' }
  ]
} as const

/**
 * Generate a random salt for order uniqueness
 */
function generateSalt(): bigint {
  return BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
}

/**
 * Create and sign an order
 */
export async function createSignedOrder(params: {
  tokenId: string
  side: OrderSide
  size: number    // Number of shares
  price: number   // Price per share (0.01 to 0.99)
  userAddress: `0x${string}`
}): Promise<{ order: object; signature: string } | null> {
  try {
    const walletClient = await getWalletClient(config)
    if (!walletClient) {
      console.error('No wallet client available')
      return null
    }

    const { tokenId, side, size, price, userAddress } = params
    
    // Calculate amounts
    // For BUY: makerAmount = USDC to spend, takerAmount = shares to receive
    // For SELL: makerAmount = shares to sell, takerAmount = USDC to receive
    const priceInUSDC = price // Price is already in USDC (e.g., 0.65 = 65 cents)
    const sizeInShares = size
    
    let makerAmount: bigint
    let takerAmount: bigint
    
    if (side === 'BUY') {
      // Spending USDC to get shares
      makerAmount = parseUnits((priceInUSDC * sizeInShares).toFixed(6), 6) // USDC (6 decimals)
      takerAmount = parseUnits(sizeInShares.toString(), 6) // Shares (also 6 decimals in Polymarket)
    } else {
      // Selling shares to get USDC
      makerAmount = parseUnits(sizeInShares.toString(), 6)
      takerAmount = parseUnits((priceInUSDC * sizeInShares).toFixed(6), 6)
    }

    // Create the order object
    const order = {
      salt: generateSalt(),
      maker: userAddress,
      signer: userAddress,
      taker: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Anyone can fill
      tokenId: BigInt(tokenId),
      makerAmount,
      takerAmount,
      expiration: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24), // 24 hours
      nonce: BigInt(0),
      feeRateBps: BigInt(0), // Fee rate in basis points
      side: side === 'BUY' ? 0 : 1,
      signatureType: 0 // EOA signature
    }

    // Sign the order with EIP-712
    const signature = await walletClient.signTypedData({
      domain: getOrderDomain(),
      types: ORDER_TYPES,
      primaryType: 'Order',
      message: order
    })

    return { order, signature }
  } catch (error) {
    console.error('Error creating signed order:', error)
    return null
  }
}

/**
 * Convert BigInt values to strings for JSON serialization
 */
function serializeOrder(order: object): object {
  const serialized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(order)) {
    if (typeof value === 'bigint') {
      serialized[key] = value.toString()
    } else {
      serialized[key] = value
    }
  }
  return serialized
}

/**
 * Submit a signed order to Polymarket CLOB
 * Uses server-side API to avoid CORS issues
 */
export async function submitOrder(
  order: object, 
  signature: string
): Promise<OrderResult> {
  try {
    // Serialize BigInt values to strings for JSON
    const serializedOrder = serializeOrder(order)
    
    // Call our server API to submit order (avoids CORS)
    const response = await fetch('/api/trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submit_order',
        order: serializedOrder,
        signature,
        userAddress: (serializedOrder as { maker: string }).maker
      })
    })

    const result = await response.json()
    
    if (!result.success) {
      console.error('Order submission failed:', result.message)
      return {
        success: false,
        message: result.message || 'Order submission failed'
      }
    }

    return {
      success: true,
      orderId: result.orderId,
      message: result.message || 'Order placed successfully!'
    }
  } catch (error) {
    console.error('Error submitting order:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit order'
    }
  }
}

/**
 * High-level function to place an order
 * Combines creating, signing, and submitting an order
 */
export async function placePolymarketOrder(params: {
  tokenId: string       // The CLOB token ID (from market.yesTokenId or market.noTokenId)
  side: TokenSide       // 'YES' or 'NO'
  orderSide: OrderSide  // 'BUY' or 'SELL'
  size: number          // Number of shares
  price: number         // Price (0.01 to 0.99)
  userAddress: `0x${string}`
}): Promise<OrderResult> {
  const { tokenId, side, orderSide, size, price, userAddress } = params

  try {
    if (!tokenId) {
      return {
        success: false,
        message: 'Token ID is required for trading'
      }
    }

    console.log('Placing order with token ID:', tokenId)

    // Step 2: Create and sign the order
    console.log('Creating signed order...')
    const signedOrder = await createSignedOrder({
      tokenId,
      side: orderSide,
      size,
      price,
      userAddress
    })

    if (!signedOrder) {
      return {
        success: false,
        message: 'Failed to sign order. Please try again.'
      }
    }

    console.log('Order signed, submitting to CLOB...')

    // Step 3: Submit to CLOB
    const result = await submitOrder(signedOrder.order, signedOrder.signature)
    
    return result
  } catch (error) {
    console.error('Error placing order:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error placing order'
    }
  }
}

/**
 * Get user's open orders
 */
export async function getUserOrders(userAddress: string): Promise<object[]> {
  try {
    const response = await fetch(`${CLOB_API}/orders?maker=${userAddress}`)
    
    if (!response.ok) {
      console.error('Failed to fetch user orders')
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return []
  }
}

/**
 * Cancel an open order
 */
export async function cancelOrder(orderId: string): Promise<boolean> {
  try {
    const response = await fetch(`${CLOB_API}/order/${orderId}`, {
      method: 'DELETE'
    })
    
    return response.ok
  } catch (error) {
    console.error('Error canceling order:', error)
    return false
  }
}

