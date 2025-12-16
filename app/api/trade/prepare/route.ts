import { NextRequest, NextResponse } from 'next/server'

// Polymarket CTF Exchange contract on Polygon
const CTF_EXCHANGE = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E'
const CHAIN_ID = 137

// Proxy wallet address from environment (if using Polymarket proxy wallet)
const POLYMARKET_FUNDER = process.env.POLYMARKET_FUNDER

// USDC.e on Polygon (what Polymarket uses)
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'

// EIP-712 Domain for Polymarket orders
const DOMAIN = {
  name: 'Polymarket CTF Exchange',
  version: '1',
  chainId: CHAIN_ID,
  verifyingContract: CTF_EXCHANGE as `0x${string}`
}

// EIP-712 Types for Polymarket orders
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
}

// Generate a random salt
function generateSalt(): string {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  return BigInt('0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, tokenId, side, size, price, proxyWalletAddress } = body

    if (!walletAddress || !tokenId || !side || !size || !price) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters'
      })
    }

    // If proxy wallet is provided (from env or request), use it for maker/signer (GNOSIS_SAFE)
    // Otherwise use MetaMask wallet (EOA)
    const proxyWallet = proxyWalletAddress || POLYMARKET_FUNDER
    const useProxyWallet = !!proxyWallet
    const makerAddress = useProxyWallet ? proxyWallet : walletAddress
    const signatureType = useProxyWallet ? 2 : 0 // 2 = GNOSIS_SAFE, 0 = EOA

    console.log('Preparing order...')
    console.log('Signing wallet (MetaMask):', walletAddress)
    if (useProxyWallet) {
      console.log('Using proxy wallet for maker/signer:', proxyWalletAddress)
      console.log('Signature type: GNOSIS_SAFE (2)')
    } else {
      console.log('Using MetaMask wallet for maker/signer')
      console.log('Signature type: EOA (0)')
    }
    console.log('Token:', tokenId, 'Side:', side, 'Size:', size, 'Price:', price)

    // Calculate amounts (USDC has 6 decimals)
    const priceFloat = parseFloat(price)
    const sizeFloat = parseFloat(size)
    
    // makerAmount = what the maker pays (USDC)
    // takerAmount = what the maker receives (shares)
    // For a BUY order: maker pays USDC, receives shares
    const makerAmount = Math.floor(sizeFloat * priceFloat * 1e6) // USDC amount in smallest units
    const takerAmount = Math.floor(sizeFloat * 1e6) // Share amount (also 6 decimals on Polymarket)

    // Order expiration (1 hour from now)
    const expiration = Math.floor(Date.now() / 1000) + 3600

    // Generate order
    // For proxy wallets: maker/signer = proxy wallet, signatureType = 2
    // For direct wallets: maker/signer = MetaMask wallet, signatureType = 0
    const order = {
      salt: generateSalt(),
      maker: makerAddress as `0x${string}`,
      signer: makerAddress as `0x${string}`, // Use proxy wallet if provided
      taker: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Anyone can fill
      tokenId: BigInt(tokenId).toString(),
      makerAmount: makerAmount.toString(),
      takerAmount: takerAmount.toString(),
      expiration: expiration.toString(),
      nonce: '0', // Can be 0 for new orders
      feeRateBps: '0', // No additional fee
      side: side === 'BUY' ? 0 : 1, // 0 = BUY, 1 = SELL
      signatureType: signatureType // 2 for GNOSIS_SAFE (proxy), 0 for EOA (direct)
    }

    console.log('Order prepared:', order)

    return NextResponse.json({
      success: true,
      domain: DOMAIN,
      types: ORDER_TYPES,
      order,
      message: 'Order prepared for signing'
    })
  } catch (error: any) {
    console.error('Error preparing order:', error)
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to prepare order'
    }, { status: 500 })
  }
}

