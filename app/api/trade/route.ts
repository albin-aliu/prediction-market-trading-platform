import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Polymarket API endpoints
const CLOB_HOST = process.env.POLYMARKET_CLOB_HOST || 'https://clob.polymarket.com'
const GAMMA_HOST = 'https://gamma-api.polymarket.com'
const API_KEY = process.env.POLYMARKET_API_KEY
const API_SECRET = process.env.POLYMARKET_SECRET
const API_PASSPHRASE = process.env.POLYMARKET_PASSPHRASE

/**
 * Generate URL-safe HMAC signature for Polymarket API
 * Must match their exact format: base64 with + -> - and / -> _
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
  
  // URL-safe base64: replace + with - and / with _
  return sig.replace(/\+/g, '-').replace(/\//g, '_')
}

/**
 * Make authenticated request to Polymarket CLOB API
 */
async function clobRequest(
  method: string,
  path: string,
  userAddress: string,
  body?: object
): Promise<Response> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const bodyStr = body ? JSON.stringify(body) : ''
  const signature = generateSignature(timestamp, method, path, bodyStr)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'POLY_ADDRESS': userAddress,
    'POLY_SIGNATURE': signature,
    'POLY_TIMESTAMP': timestamp,
    'POLY_API_KEY': API_KEY || '',
    'POLY_PASSPHRASE': API_PASSPHRASE || '',
  }

  console.log('CLOB Request:', method, path)
  console.log('Headers:', { ...headers, POLY_SIGNATURE: '[hidden]' })

  return fetch(`${CLOB_HOST}${path}`, {
    method,
    headers,
    body: bodyStr || undefined,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, marketId, conditionId, tokenId, side, order, signature } = body

    // Handle different actions
    switch (action) {
      case 'get_market_tokens': {
        // Fetch market tokens from Gamma API (server-side to avoid CORS)
        try {
          const response = await fetch(
            `${GAMMA_HOST}/markets?condition_id=${conditionId}`,
            { headers: { 'Accept': 'application/json' } }
          )
          
          if (!response.ok) {
            return NextResponse.json({ 
              success: false, 
              message: 'Failed to fetch market tokens' 
            })
          }
          
          const markets = await response.json()
          if (markets.length === 0) {
            return NextResponse.json({ 
              success: false, 
              message: 'Market not found' 
            })
          }
          
          const market = markets[0]
          return NextResponse.json({
            success: true,
            tokens: {
              questionId: market.questionId || conditionId,
              yesTokenId: market.tokens?.[0]?.token_id || '',
              noTokenId: market.tokens?.[1]?.token_id || ''
            }
          })
        } catch (error) {
          console.error('Error fetching market tokens:', error)
          return NextResponse.json({ 
            success: false, 
            message: 'Error fetching market tokens' 
          })
        }
      }

      case 'submit_order': {
        // Submit signed order to CLOB (server-side to avoid CORS)
        if (!API_KEY || !API_SECRET || !API_PASSPHRASE) {
          return NextResponse.json({
            success: false,
            error: 'API credentials not configured',
            message: 'Please set POLYMARKET_API_KEY, POLYMARKET_SECRET, and POLYMARKET_PASSPHRASE in .env.local'
          }, { status: 500 })
        }

        const { order: orderData, signature: orderSignature, userAddress } = body
        
        if (!userAddress) {
          return NextResponse.json({
            success: false,
            message: 'User address is required'
          })
        }

        try {
          const response = await clobRequest('POST', '/order', userAddress, {
            order: orderData,
            signature: orderSignature,
            owner: orderData.maker
          })
          
          const responseText = await response.text()
          console.log('CLOB response:', response.status, responseText)
          
          if (!response.ok) {
            return NextResponse.json({
              success: false,
              message: `Order submission failed: ${responseText}`
            })
          }
          
          const result = JSON.parse(responseText)
          return NextResponse.json({
            success: true,
            orderId: result.orderID || result.id,
            message: 'Order placed successfully!'
          })
        } catch (error) {
          console.error('Error submitting order:', error)
          return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to submit order'
          })
        }
      }

      case 'get_orderbook': {
        // Get order book for a market (public endpoint, no auth needed)
        const response = await fetch(`${CLOB_HOST}/book?token_id=${tokenId}`)
        const data = await response.json()
        return NextResponse.json({ success: true, orderbook: data })
      }

      case 'get_price': {
        // Get current price for a token (public endpoint)
        const response = await fetch(`${CLOB_HOST}/price?token_id=${tokenId}&side=${side}`)
        const data = await response.json()
        return NextResponse.json({ success: true, price: data })
      }

      case 'get_markets': {
        // Get market info (public endpoint)
        const response = await fetch(`${CLOB_HOST}/markets/${marketId}`)
        const data = await response.json()
        return NextResponse.json({ success: true, market: data })
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          validActions: ['get_market_tokens', 'submit_order', 'get_orderbook', 'get_price', 'get_markets']
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

