import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Polymarket CLOB API configuration
const CLOB_HOST = process.env.POLYMARKET_CLOB_HOST || 'https://clob.polymarket.com'
const API_KEY = process.env.POLYMARKET_API_KEY
const API_SECRET = process.env.POLYMARKET_SECRET
const API_PASSPHRASE = process.env.POLYMARKET_PASSPHRASE

/**
 * Generate HMAC signature for Polymarket API
 */
function generateSignature(
  timestamp: string,
  method: string,
  requestPath: string,
  body: string = ''
): string {
  const message = timestamp + method + requestPath + body
  const hmac = crypto.createHmac('sha256', Buffer.from(API_SECRET || '', 'base64'))
  return hmac.update(message).digest('base64')
}

/**
 * Make authenticated request to Polymarket CLOB API
 */
async function clobRequest(
  method: string,
  path: string,
  body?: object
): Promise<Response> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const bodyStr = body ? JSON.stringify(body) : ''
  const signature = generateSignature(timestamp, method, path, bodyStr)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'POLY_API_KEY': API_KEY || '',
    'POLY_SIGNATURE': signature,
    'POLY_TIMESTAMP': timestamp,
    'POLY_PASSPHRASE': API_PASSPHRASE || '',
  }

  return fetch(`${CLOB_HOST}${path}`, {
    method,
    headers,
    body: bodyStr || undefined,
  })
}

export async function POST(request: NextRequest) {
  try {
    // Check if API credentials are configured
    if (!API_KEY || !API_SECRET || !API_PASSPHRASE) {
      return NextResponse.json({
        success: false,
        error: 'API credentials not configured',
        message: 'Please set POLYMARKET_API_KEY, POLYMARKET_SECRET, and POLYMARKET_PASSPHRASE in .env.local'
      }, { status: 500 })
    }

    const body = await request.json()
    const { action, marketId, tokenId, side, amount, price, userAddress } = body

    // Handle different actions
    switch (action) {
      case 'get_orderbook': {
        // Get order book for a market
        const response = await clobRequest('GET', `/book?token_id=${tokenId}`)
        const data = await response.json()
        return NextResponse.json({ success: true, orderbook: data })
      }

      case 'get_price': {
        // Get current price for a token
        const response = await clobRequest('GET', `/price?token_id=${tokenId}&side=${side}`)
        const data = await response.json()
        return NextResponse.json({ success: true, price: data })
      }

      case 'place_order': {
        // Place a limit order
        // Note: This requires the user to sign the order with their wallet
        // The API credentials authenticate the builder, but the order must be signed by the user
        
        const orderPayload = {
          tokenID: tokenId,
          price: price.toString(),
          size: amount.toString(),
          side: side.toUpperCase(),
          feeRateBps: "200", // 2% fee
          nonce: Date.now(),
          expiration: 0, // Never expires
          taker: "0x0000000000000000000000000000000000000000" // Any taker
        }

        // For now, return the order payload that needs to be signed by the user's wallet
        return NextResponse.json({
          success: true,
          message: 'Order prepared - needs wallet signature',
          orderPayload,
          instructions: 'Sign this order with your wallet to execute the trade'
        })
      }

      case 'get_markets': {
        // Get market info
        const response = await clobRequest('GET', `/markets/${marketId}`)
        const data = await response.json()
        return NextResponse.json({ success: true, market: data })
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          validActions: ['get_orderbook', 'get_price', 'place_order', 'get_markets']
        }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Trade API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Trade failed',
      message: error.message || 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check API status
export async function GET() {
  const isConfigured = !!(API_KEY && API_SECRET && API_PASSPHRASE)
  
  return NextResponse.json({
    success: true,
    configured: isConfigured,
    host: CLOB_HOST,
    message: isConfigured 
      ? 'Polymarket API is configured and ready' 
      : 'API credentials not configured - please add them to .env.local'
  })
}

