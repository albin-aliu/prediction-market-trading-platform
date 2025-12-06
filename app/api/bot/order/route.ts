import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Polymarket configuration
const CLOB_HOST = 'https://clob.polymarket.com'
const CHAIN_ID = 137
const POLYMARKET_EXCHANGE = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E'

// API credentials
const API_KEY = process.env.POLYMARKET_API_KEY
const API_SECRET = process.env.POLYMARKET_SECRET
const API_PASSPHRASE = process.env.POLYMARKET_PASSPHRASE

// EIP-712 Domain for Polymarket orders
const ORDER_DOMAIN = {
  name: 'Polymarket CTF Exchange',
  version: '1',
  chainId: CHAIN_ID,
  verifyingContract: POLYMARKET_EXCHANGE as `0x${string}`
}

// EIP-712 Order types
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
 * Generate URL-safe HMAC signature
 */
function generateSignature(
  timestamp: string,
  method: string,
  requestPath: string,
  body: string = ''
): string {
  const message = timestamp + method + requestPath + body
  const base64Secret = Buffer.from(API_SECRET || '', 'base64')
  const hmac = crypto.createHmac('sha256', base64Secret)
  const sig = hmac.update(message).digest('base64')
  return sig.replace(/\+/g, '-').replace(/\//g, '_')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'build_order': {
        // Build order data for client to sign
        const { userAddress, tokenId, side, size, price } = body

        if (!userAddress || !tokenId || !side || !size || !price) {
          return NextResponse.json({
            success: false,
            message: 'Missing required parameters'
          })
        }

        // Generate unique salt
        const salt = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString()
        
        // Calculate amounts
        // For BUY: makerAmount = USDC to spend, takerAmount = shares to receive
        const priceNum = parseFloat(price)
        const sizeNum = parseFloat(size)
        const usdcAmount = Math.floor(priceNum * sizeNum * 1e6) // USDC has 6 decimals
        const shareAmount = Math.floor(sizeNum * 1e6) // Shares also 6 decimals
        
        // Build order object (all values as strings for EIP-712)
        const order = {
          salt: salt,
          maker: userAddress,
          signer: userAddress,
          taker: '0x0000000000000000000000000000000000000000',
          tokenId: tokenId,
          makerAmount: usdcAmount.toString(),
          takerAmount: shareAmount.toString(),
          expiration: (Math.floor(Date.now() / 1000) + 60 * 60 * 24).toString(), // 24 hours
          nonce: '0',
          feeRateBps: '0',
          side: side === 'BUY' ? '0' : '1',
          signatureType: '0' // EOA
        }

        return NextResponse.json({
          success: true,
          domain: ORDER_DOMAIN,
          types: ORDER_TYPES,
          order
        })
      }

      case 'submit_order': {
        // Submit signed order to CLOB
        if (!API_KEY || !API_SECRET || !API_PASSPHRASE) {
          return NextResponse.json({
            success: false,
            message: 'API credentials not configured'
          })
        }

        const { order, signature, userAddress } = body

        if (!order || !signature || !userAddress) {
          return NextResponse.json({
            success: false,
            message: 'Missing order, signature, or userAddress'
          })
        }

        // Prepare the request
        const timestamp = Math.floor(Date.now() / 1000).toString()
        const path = '/order'
        const requestBody = JSON.stringify({
          order,
          signature,
          owner: userAddress
        })
        
        const hmacSignature = generateSignature(timestamp, 'POST', path, requestBody)

        console.log('Submitting order to CLOB...')
        console.log('Order:', JSON.stringify(order, null, 2))

        const response = await fetch(`${CLOB_HOST}${path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'POLY_ADDRESS': userAddress,
            'POLY_SIGNATURE': hmacSignature,
            'POLY_TIMESTAMP': timestamp,
            'POLY_API_KEY': API_KEY,
            'POLY_PASSPHRASE': API_PASSPHRASE
          },
          body: requestBody
        })

        const responseText = await response.text()
        console.log('CLOB Response:', response.status, responseText)

        if (!response.ok) {
          return NextResponse.json({
            success: false,
            message: `Order failed: ${responseText}`
          })
        }

        try {
          const result = JSON.parse(responseText)
          return NextResponse.json({
            success: true,
            orderId: result.orderID || result.id,
            message: 'Order placed successfully!'
          })
        } catch {
          return NextResponse.json({
            success: true,
            message: 'Order submitted'
          })
        }
      }

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        })
    }

  } catch (error: any) {
    console.error('Order API error:', error)
    return NextResponse.json({
      success: false,
      message: error.message || 'Order failed'
    }, { status: 500 })
  }
}

