import { NextRequest, NextResponse } from 'next/server'
import { Wallet } from '@ethersproject/wallet'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ClobClient } from '@polymarket/clob-client'

// Polygon configuration
const POLYGON_RPC = 'https://polygon-rpc.com'
const CHAIN_ID = 137

// Polymarket CLOB host
const CLOB_HOST = 'https://clob.polymarket.com'

// API credentials from environment (L2 auth)
const API_KEY = process.env.POLYMARKET_API_KEY
const API_SECRET = process.env.POLYMARKET_SECRET
const API_PASSPHRASE = process.env.POLYMARKET_PASSPHRASE

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
          console.log('Creating CLOB client with L2 auth...')
          console.log('Token:', tokenId)
          console.log('Side:', side, 'Size:', size, 'Price:', price)
          
          // Initialize client with wallet + L2 credentials
          const client = new ClobClient(
            CLOB_HOST,
            CHAIN_ID,
            wallet,
            creds, // L2 credentials
            0, // EOA signature type
            walletAddress, // Funder
            undefined,
            true // useServerTime
          )

          // Get market info
          console.log('Getting tick size...')
          const tickSize = await client.getTickSize(tokenId)
          const negRisk = await client.getNegRisk(tokenId)
          console.log('Tick size:', tickSize, 'Neg risk:', negRisk)

          // Create and post order using the SDK
          console.log('Creating and posting order...')
          const orderResult = await client.createAndPostOrder({
            tokenID: tokenId,
            price: parseFloat(price),
            size: parseFloat(size),
            side: side.toUpperCase() as 'BUY' | 'SELL',
          }, {
            tickSize: tickSize.toString(),
            negRisk: negRisk
          })

          console.log('Order result:', orderResult)

          return NextResponse.json({
            success: true,
            order: orderResult,
            message: 'Order placed successfully!'
          })
        } catch (error: any) {
          console.error('Error placing order:', error)
          return NextResponse.json({
            success: false,
            message: error.message || 'Failed to place order'
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

