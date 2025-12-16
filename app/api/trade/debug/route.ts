import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.POLYMARKET_API_KEY
const API_SECRET = process.env.POLYMARKET_SECRET
const API_PASSPHRASE = process.env.POLYMARKET_PASSPHRASE
const POLYMARKET_FUNDER = process.env.POLYMARKET_FUNDER

export async function GET(request: NextRequest) {
  // Return configuration without exposing secrets
  return NextResponse.json({
    configured: {
      hasApiKey: !!API_KEY,
      apiKeyPrefix: API_KEY?.substring(0, 15) + '...',
      hasSecret: !!API_SECRET,
      hasPassphrase: !!API_PASSPHRASE,
      funderAddress: POLYMARKET_FUNDER || 'Not set (will use MetaMask wallet)',
    },
    expected: {
      polyAddress: POLYMARKET_FUNDER || 'MetaMask wallet address',
      signatureType: POLYMARKET_FUNDER ? 'GNOSIS_SAFE (2)' : 'EOA (0)',
      note: POLYMARKET_FUNDER 
        ? 'Using proxy wallet for POLY_ADDRESS. API keys must match this address.'
        : 'Using MetaMask wallet for POLY_ADDRESS. API keys must match MetaMask address.'
    },
    check: {
      apiKeyMatchesFunder: POLYMARKET_FUNDER 
        ? 'API keys should be for: ' + POLYMARKET_FUNDER
        : 'API keys should be for your MetaMask wallet address',
      currentFunder: POLYMARKET_FUNDER || 'Not set - will use MetaMask address'
    }
  })
}


