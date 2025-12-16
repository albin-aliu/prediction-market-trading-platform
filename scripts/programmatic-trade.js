#!/usr/bin/env node

/**
 * Programmatic Trading Script
 * 
 * This script allows you to place trades programmatically from the server
 * without using the frontend UI. It uses ethers to sign orders instead of MetaMask.
 * 
 * Usage:
 *   node scripts/programmatic-trade.js <tokenId> <side> <size> <price>
 * 
 * Example:
 *   node scripts/programmatic-trade.js \
 *     64752768068751003284591786845158970622611273424843556508270903047927272044122 \
 *     BUY \
 *     1 \
 *     0.5
 */

const { ethers } = require('ethers')

// Load environment variables from .env.local (if dotenv is installed)
// Alternative: Pass env vars directly: TRADING_PRIVATE_KEY=0x... node scripts/programmatic-trade.js ...
try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv not installed - use environment variables from shell instead
  // Example: TRADING_PRIVATE_KEY=0x... node scripts/programmatic-trade.js ...
}

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000'
const PRIVATE_KEY = process.env.TRADING_PRIVATE_KEY // Your wallet private key (keep secret!)

// EIP-712 Domain for Polymarket orders
const DOMAIN = {
  name: 'Polymarket CTF Exchange',
  version: '1',
  chainId: 137,
  verifyingContract: '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E'
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

async function placeTrade(tokenId, side, size, price) {
  try {
    // Check for private key
    if (!PRIVATE_KEY) {
      throw new Error(
        'TRADING_PRIVATE_KEY not set. Either:\n' +
        '  1. Add TRADING_PRIVATE_KEY=0x... to .env.local and install dotenv: npm install dotenv\n' +
        '  2. Or pass it directly: TRADING_PRIVATE_KEY=0x... node scripts/programmatic-trade.js ...'
      )
    }

    // Create wallet from private key
    const wallet = new ethers.Wallet(PRIVATE_KEY)
    const walletAddress = wallet.address

    console.log('🔐 Wallet Address:', walletAddress)
    console.log('📊 Trade Parameters:')
    console.log('   Token ID:', tokenId)
    console.log('   Side:', side)
    console.log('   Size:', size, 'shares')
    console.log('   Price:', price, 'USDC per share')
    console.log('   Total Cost:', (parseFloat(size) * parseFloat(price)).toFixed(2), 'USDC')
    console.log('')

    // Create and post order in one step (simplified!)
    console.log('📤 Creating and posting order to Polymarket...')
    const submitResponse = await fetch(`${SERVER_URL}/api/trade/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenId,
        side: side.toUpperCase(),
        size: size.toString(),
        price: price.toString(),
        walletAddress
      })
    })

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text()
      throw new Error(`Submit failed: ${submitResponse.status} - ${errorText}`)
    }

    const result = await submitResponse.json()
    
    if (result.success) {
      console.log('✅ Order placed successfully!')
      console.log('   Result:', JSON.stringify(result, null, 2))
      return result
    } else {
      throw new Error(`Order rejected: ${result.message}`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    throw error
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.length < 4) {
    console.log('Usage: node scripts/programmatic-trade.js <tokenId> <side> <size> <price>')
    console.log('')
    console.log('Example:')
    console.log('  node scripts/programmatic-trade.js \\')
    console.log('    64752768068751003284591786845158970622611273424843556508270903047927272044122 \\')
    console.log('    BUY \\')
    console.log('    1 \\')
    console.log('    0.5')
    console.log('')
    console.log('Environment Variables Required:')
    console.log('  TRADING_PRIVATE_KEY - Your wallet private key (keep secret!)')
    console.log('  SERVER_URL - Your server URL (default: http://localhost:3000)')
    process.exit(1)
  }

  const [tokenId, side, size, price] = args

  // Validate inputs
  if (side.toUpperCase() !== 'BUY' && side.toUpperCase() !== 'SELL') {
    console.error('❌ Side must be BUY or SELL')
    process.exit(1)
  }

  if (isNaN(parseFloat(size)) || parseFloat(size) <= 0) {
    console.error('❌ Size must be a positive number')
    process.exit(1)
  }

  if (isNaN(parseFloat(price)) || parseFloat(price) <= 0 || parseFloat(price) > 1) {
    console.error('❌ Price must be between 0 and 1')
    process.exit(1)
  }

  placeTrade(tokenId, side, size, price)
    .then(() => {
      console.log('')
      console.log('🎉 Trade completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('')
      console.error('💥 Trade failed!')
      process.exit(1)
    })
}

module.exports = { placeTrade }
