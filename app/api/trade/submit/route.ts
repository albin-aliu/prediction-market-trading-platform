import { NextRequest, NextResponse } from 'next/server'
import { Wallet } from '@ethersproject/wallet'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ClobClient, OrderType, Side } from '@polymarket/clob-client'

const CLOB_HOST = 'https://clob.polymarket.com'
const CHAIN_ID = 137
const POLYGON_RPC = 'https://polygon-rpc.com'

// API credentials from environment (for L2 auth)
const API_KEY = process.env.POLYMARKET_API_KEY
const API_SECRET = process.env.POLYMARKET_SECRET
const API_PASSPHRASE = process.env.POLYMARKET_PASSPHRASE
const POLYMARKET_FUNDER = process.env.POLYMARKET_FUNDER // Proxy wallet address
const TRADING_PRIVATE_KEY = process.env.TRADING_PRIVATE_KEY

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tokenId, side, size, price, walletAddress } = body

    if (!tokenId || !side || !size || !price) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters: tokenId, side, size, price'
      })
    }

    // Check API credentials
    if (!API_KEY || !API_SECRET || !API_PASSPHRASE) {
      return NextResponse.json({
        success: false,
        message: 'API credentials not configured'
      })
    }

    // Check if we have private key
    if (!TRADING_PRIVATE_KEY) {
      return NextResponse.json({
        success: false,
        message: 'TRADING_PRIVATE_KEY not configured'
      })
    }

    // Determine signature type and funder address
    // signatureType: 1 = Magic/Email, 2 = Browser Wallet (MetaMask), 0 = EOA
    const useProxyWallet = !!POLYMARKET_FUNDER
    const funderAddress = useProxyWallet ? POLYMARKET_FUNDER : walletAddress
    const signatureType = useProxyWallet ? 2 : 0 // 2 = Browser Wallet (MetaMask), 0 = EOA
    
    // Create wallet from private key
    const cleanKey = TRADING_PRIVATE_KEY.startsWith('0x') ? TRADING_PRIVATE_KEY : `0x${TRADING_PRIVATE_KEY}`
    const provider = new JsonRpcProvider(POLYGON_RPC)
    const wallet = new Wallet(cleanKey, provider)
    const actualWalletAddress = wallet.address

    console.log('🔑 Authentication Parameters:')
    console.log('   Wallet Address (from private key):', actualWalletAddress)
    console.log('   Funder Address:', funderAddress)
    console.log('   Signature Type:', signatureType, signatureType === 2 ? '(Browser Wallet/MetaMask)' : signatureType === 1 ? '(Magic/Email)' : '(EOA)')

    // Derive API key from wallet (recommended approach - matches official example)
    console.log('📝 Step 1: Deriving API key from wallet...')
    const tempClient = new ClobClient(
      CLOB_HOST,
      CHAIN_ID,
      wallet,
      undefined, // No creds yet - will derive
      undefined, // signatureType not needed for derivation
      undefined, // funder not needed for derivation
      undefined,
      true
    )
    
    const apiCreds = await tempClient.createOrDeriveApiKey()
    console.log('✅ API key derived successfully')
    console.log('   API Key:', apiCreds.key.substring(0, 20) + '...')

    // Initialize ClobClient with derived credentials (matching official example)
    console.log('📝 Step 2: Initializing ClobClient with derived credentials...')
    const client = new ClobClient(
      CLOB_HOST,
      CHAIN_ID,
      wallet,
      apiCreds,
      signatureType,
      funderAddress,
      undefined,
      true // useServerTime
    )
    
    console.log('✅ ClobClient initialized')

    // Get market info (tickSize and negRisk)
    console.log('📊 Step 1: Getting market info (tickSize, negRisk)...')
    const tickSize = await client.getTickSize(tokenId)
    const negRisk = await client.getNegRisk(tokenId)
    console.log('✅ Market info retrieved:', { tickSize, negRisk })

    // Create and post order in one step
    console.log('📤 Step 2: Creating and posting order to Polymarket...')
    console.log('   Token ID:', tokenId)
    console.log('   Side:', side)
    console.log('   Size:', size)
    console.log('   Price:', price)
    console.log('   Funder Address:', funderAddress)
    console.log('   Signature Type:', signatureType)
    
    const result = await client.createAndPostOrder(
      {
        tokenID: tokenId,
        price: parseFloat(price),
        size: parseFloat(size),
        side: side.toUpperCase() === 'BUY' ? Side.BUY : Side.SELL,
        feeRateBps: 0,
      },
      {
        tickSize: tickSize as any,
        negRisk: negRisk
      },
      OrderType.GTC
    )
    
    console.log('📥 Response from Polymarket:', JSON.stringify(result, null, 2))

    // Check if the result contains an error (look for error fields, not status)
    if (result && typeof result === 'object') {
      // Check for actual error indicators
      const hasError = 'error' in result || 
                       'errorMsg' in result && result.errorMsg !== '' ||
                       (result.status && typeof result.status === 'number' && result.status >= 400)
      
      // Success indicators
      const isSuccess = result.success === true || 
                       result.orderID !== undefined ||
                       result.status === 'matched' ||
                       result.status === 'open'
      
      if (hasError && !isSuccess) {
        const errorMsg = result.error || result.errorMsg || result.message || 'Order submission failed'
        const statusCode = result.status && typeof result.status === 'number' && result.status >= 200 && result.status < 600 
          ? result.status 
          : 400
        
        return NextResponse.json({
          success: false,
          message: `Order rejected: ${errorMsg}`,
          errorDetails: result
        }, { status: statusCode })
      }
    }
    
    return NextResponse.json({
      success: true,
      order: result,
      message: 'Order placed successfully!'
    })

  } catch (error: any) {
    console.error('Error submitting order:', error)
    const errorDetails = error.response?.data || error.response || error.message || error.toString()
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to submit order',
      errorDetails: errorDetails
    }, { status: 500 })
  }
}

