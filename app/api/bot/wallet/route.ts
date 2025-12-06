import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// Polygon RPC
const POLYGON_RPC = 'https://polygon-rpc.com'

// USDC on Polygon
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)'
]

export async function POST(request: NextRequest) {
  try {
    const { privateKey } = await request.json()

    if (!privateKey) {
      return NextResponse.json({
        success: false,
        message: 'Private key is required'
      })
    }

    // Clean the private key (remove 0x prefix if present)
    const cleanKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`

    // Validate by creating a wallet
    let wallet: ethers.Wallet
    try {
      wallet = new ethers.Wallet(cleanKey)
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: 'Invalid private key format'
      })
    }

    const address = wallet.address

    // Connect to Polygon to get balances
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC)
    const connectedWallet = wallet.connect(provider)

    // Get POL balance
    const polBalance = await provider.getBalance(address)
    const polFormatted = ethers.formatEther(polBalance)

    // Get USDC balance
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider)
    const usdcBalance = await usdcContract.balanceOf(address)
    const usdcFormatted = ethers.formatUnits(usdcBalance, 6)

    return NextResponse.json({
      success: true,
      address,
      balance: {
        usdc: parseFloat(usdcFormatted).toFixed(2),
        matic: parseFloat(polFormatted).toFixed(4)
      }
    })

  } catch (error: any) {
    console.error('Wallet API error:', error)
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to validate wallet'
    }, { status: 500 })
  }
}

