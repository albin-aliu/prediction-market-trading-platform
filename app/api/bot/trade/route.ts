import { NextRequest, NextResponse } from 'next/server'
import { Wallet } from '@ethersproject/wallet'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ClobClient } from '@polymarket/clob-client'
import * as crypto from 'crypto'

// Polygon configuration
const POLYGON_RPC = 'https://polygon-rpc.com'
const CHAIN_ID = 137

// Polymarket CLOB host
const CLOB_HOST = 'https://clob.polymarket.com'

// API credentials from environment (L2 auth)
const API_KEY = process.env.POLYMARKET_API_KEY
const API_SECRET = process.env.POLYMARKET_SECRET
const API_PASSPHRASE = process.env.POLYMARKET_PASSPHRASE
const POLYMARKET_FUNDER = process.env.POLYMARKET_FUNDER

// Generate HMAC signature for L2 auth
function createL2Signature(
  secret: string,
  timestamp: string,
  method: string,
  requestPath: string,
  body: string = ''
): string {
  const message = timestamp + method + requestPath + body
  // Convert URL-safe base64 secret to standard base64 for decoding
  const standardSecret = secret.replace(/-/g, '+').replace(/_/g, '/')
  const key = Buffer.from(standardSecret, 'base64')
  const hmac = crypto.createHmac('sha256', key)
  hmac.update(message)
  // Return standard base64 (Polymarket expects this)
  return hmac.digest('base64')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, privateKey, tokenId, side, size, price } = body

    if (!privateKey) {
      return NextResponse.json({
        success: false,
        message: 'Private key is required. Go to /bot to configure.'
      })
    }

    // Create wallet from private key using ethers v5 (SDK compatible)
    const cleanKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
    const provider = new JsonRpcProvider(POLYGON_RPC)
    const wallet = new Wallet(cleanKey, provider)
    const walletAddress = await wallet.getAddress()

    console.log('Trading with wallet:', walletAddress)

    // L2 API credentials
    const creds = API_KEY && API_SECRET && API_PASSPHRASE ? {
      key: API_KEY,
      secret: API_SECRET,
      passphrase: API_PASSPHRASE
    } : undefined

    if (!creds) {
      return NextResponse.json({
        success: false,
        message: 'API credentials not configured in .env.local'
      })
    }

    switch (action) {
      case 'derive_api_key': {
        // Derive API key for this wallet (L1 auth)
        try {
          console.log('Deriving API key for wallet...')
          
          const client = new ClobClient(
            CLOB_HOST,
            CHAIN_ID,
            wallet,
            undefined, // No creds yet
            0, // EOA signature type
            walletAddress, // Funder is the EOA
            undefined,
            true // useServerTime
          )

          const apiKey = await client.createOrDeriveApiKey()
          console.log('API key derived:', apiKey.key)
          
          return NextResponse.json({
            success: true,
            apiKey: {
              key: apiKey.key,
              secret: apiKey.secret,
              passphrase: apiKey.passphrase
            },
            message: 'API key derived! Save these in your .env.local'
          })
        } catch (error: any) {
          console.error('Error deriving API key:', error)
          return NextResponse.json({
            success: false,
            message: error.message || 'Failed to derive API key'
          })
        }
      }

      case 'place_order': {
        if (!tokenId || !side || !size || !price) {
          return NextResponse.json({
            success: false,
            message: 'Missing order parameters: tokenId, side, size, price'
          })
        }

        try {
          console.log('========== TRADE REQUEST ==========')
          console.log('Step 1: Initializing...')
          console.log('  Token ID:', tokenId)
          console.log('  Side:', side, 'Size:', size, 'Price:', price)
          console.log('  Wallet address:', walletAddress)
          console.log('  CLOB Host:', CLOB_HOST)
          console.log('  Chain ID:', CHAIN_ID)
          
          // Step 2: Create initial client without credentials
          console.log('\nStep 2: Creating initial CLOB client (no creds)...')
          const client = new ClobClient(
            CLOB_HOST,
            CHAIN_ID,
            wallet,
            undefined, // NO pre-made credentials
            0, // EOA signature type
            walletAddress,
            undefined,
            true
          )
          console.log('  Initial client created successfully')
          
          // Step 3: Derive API credentials
          console.log('\nStep 3: Deriving API credentials from wallet...')
          let derivedCreds
          try {
            derivedCreds = await client.createOrDeriveApiKey()
            console.log('  SUCCESS! Derived credentials:')
            console.log('  - API Key:', derivedCreds.key)
            console.log('  - Secret:', derivedCreds.secret?.substring(0, 10) + '...')
            console.log('  - Passphrase:', derivedCreds.passphrase?.substring(0, 10) + '...')
          } catch (deriveError: any) {
            console.log('  FAILED to derive API key!')
            console.log('  Error:', deriveError.message)
            console.log('  Full error:', JSON.stringify(deriveError, null, 2))
            throw deriveError
          }
          
          // Step 4: Create trading client with derived creds
          console.log('\nStep 4: Creating trading client with derived creds...')
          const tradingClient = new ClobClient(
            CLOB_HOST,
            CHAIN_ID,
            wallet,
            derivedCreds,
            0,
            walletAddress,
            undefined,
            true
          )
          console.log('  Trading client created successfully')

          // Step 5: Get market info
          console.log('\nStep 5: Getting market info...')
          const tickSize = await tradingClient.getTickSize(tokenId)
          const negRisk = await tradingClient.getNegRisk(tokenId)
          console.log('  Tick size:', tickSize)
          console.log('  Neg risk:', negRisk)

          // Step 6: Create and post order
          console.log('\nStep 6: Creating and posting order...')
          let orderResult
          try {
            orderResult = await tradingClient.createAndPostOrder({
              tokenID: tokenId,
              price: parseFloat(price),
              size: parseFloat(size),
              side: side.toUpperCase() as any,
            }, {
              tickSize: tickSize as any,
              negRisk: negRisk
            })
            console.log('  Order result:', JSON.stringify(orderResult, null, 2))
          } catch (orderError: any) {
            console.log('  FAILED to create/post order!')
            console.log('  Error message:', orderError.message)
            console.log('  Error response:', orderError.response?.data)
            throw orderError
          }

          console.log('\n========== TRADE SUCCESS ==========')
          return NextResponse.json({
            success: true,
            order: orderResult,
            message: 'Order placed successfully!'
          })
        } catch (error: any) {
          console.log('\n========== TRADE FAILED ==========')
          console.error('Error type:', error.constructor?.name)
          console.error('Error message:', error.message)
          console.error('Error stack:', error.stack)
          if (error.response) {
            console.error('Response status:', error.response.status)
            console.error('Response data:', error.response.data)
          }
          return NextResponse.json({
            success: false,
            message: error.message || 'Failed to place order',
            errorDetails: {
              type: error.constructor?.name,
              message: error.message,
              response: error.response?.data
            }
          })
        }
      }

      case 'get_balance': {
        try {
          const client = new ClobClient(
            CLOB_HOST,
            CHAIN_ID,
            wallet,
            creds,
            0,
            walletAddress,
            undefined,
            true
          )

          const balance = await client.getBalanceAllowance()
          
          return NextResponse.json({
            success: true,
            balance
          })
        } catch (error: any) {
          console.error('Error fetching balance:', error)
          return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch balance'
          })
        }
      }

      case 'get_orders': {
        try {
          const client = new ClobClient(
            CLOB_HOST,
            CHAIN_ID,
            wallet,
            creds,
            0,
            walletAddress,
            undefined,
            true
          )

          const orders = await client.getOpenOrders()
          
          return NextResponse.json({
            success: true,
            orders
          })
        } catch (error: any) {
          console.error('Error fetching orders:', error)
          return NextResponse.json({
            success: false,
            message: error.message || 'Failed to fetch orders'
          })
        }
      }

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action',
          validActions: ['derive_api_key', 'place_order', 'get_balance', 'get_orders']
        })
    }

  } catch (error: any) {
    console.error('Bot trade API error:', error)
    return NextResponse.json({
      success: false,
      message: error.message || 'Trading failed'
    }, { status: 500 })
  }
}

