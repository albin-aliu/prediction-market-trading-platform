import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CLOB_HOST = 'https://clob.polymarket.com'
const API_KEY = process.env.POLYMARKET_API_KEY
const API_SECRET = process.env.POLYMARKET_SECRET
const API_PASSPHRASE = process.env.POLYMARKET_PASSPHRASE
const POLYMARKET_FUNDER = process.env.POLYMARKET_FUNDER

/**
 * Test endpoint to verify API key authentication
 * This makes a simple API call to check if credentials are valid
 */
export async function GET(request: NextRequest) {
  try {
    // Check API credentials
    if (!API_KEY || !API_SECRET || !API_PASSPHRASE) {
      return NextResponse.json({
        success: false,
        message: 'API credentials not configured',
        configured: {
          hasApiKey: !!API_KEY,
          hasSecret: !!API_SECRET,
          hasPassphrase: !!API_PASSPHRASE
        }
      }, { status: 400 })
    }

    const funderAddress = POLYMARKET_FUNDER || 'NOT_SET'
    
    // Make a simple API call to test authentication
    // Using /book endpoint as it's read-only and requires auth
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const requestPath = '/book?token_id=60487116984468020978247225474488676749601001829886755968952521846780452448915'
    const bodyStr = ''
    
    // Generate HMAC signature
    const message = timestamp + 'GET' + requestPath + bodyStr
    const standardSecret = API_SECRET.replace(/-/g, '+').replace(/_/g, '/')
    const key = Buffer.from(standardSecret, 'base64')
    const hmac = crypto.createHmac('sha256', key)
    hmac.update(message)
    const hmacSignature = hmac.digest('base64')
    
    const headers = {
      'Content-Type': 'application/json',
      'POLY_ADDRESS': funderAddress,
      'POLY_API_KEY': API_KEY,
      'POLY_PASSPHRASE': API_PASSPHRASE,
      'POLY_SIGNATURE': hmacSignature,
      'POLY_TIMESTAMP': timestamp
    }
    
    console.log('🧪 Testing API Key Authentication...')
    console.log('  POLY_ADDRESS:', funderAddress)
    console.log('  API_KEY:', API_KEY.substring(0, 15) + '...')
    
    const response = await fetch(CLOB_HOST + requestPath, {
      method: 'GET',
      headers
    })
    
    const responseText = await response.text()
    
    // 404 with "No orderbook exists" means auth worked! (just wrong token ID)
    // 401/403 means auth failed
    const isAuthError = response.status === 401 || response.status === 403
    const isNotFound = response.status === 404 && responseText.includes('No orderbook exists')
    
    if (isAuthError) {
      let errorMessage = responseText
      try {
        const errorJson = JSON.parse(responseText)
        errorMessage = errorJson.error || errorJson.message || errorJson.errorMsg || responseText
      } catch (e) {
        // Not JSON
      }
      
      return NextResponse.json({
        success: false,
        message: `API authentication failed: ${errorMessage}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          polyAddress: funderAddress,
          response: responseText.substring(0, 500),
          troubleshooting: {
            issue: 'The API key authentication failed. This usually means:',
            checks: [
              `1. API key must be generated for wallet: ${funderAddress}`,
              '2. Verify POLYMARKET_API_KEY, POLYMARKET_SECRET, and POLYMARKET_PASSPHRASE are correct',
              '3. Make sure you copied all three values correctly from Polymarket',
              '4. API keys are case-sensitive - check for typos',
              '5. If using POLYMARKET_FUNDER, the API key must match that address, not your MetaMask address'
            ]
          }
        }
      }, { status: response.status })
    }
    
    // 404 with "No orderbook exists" = auth worked, just wrong token ID
    if (isNotFound) {
      return NextResponse.json({
        success: true,
        message: '✅ API key authentication successful! (404 just means the test token ID has no orderbook)',
        details: {
          status: response.status,
          polyAddress: funderAddress,
          note: 'Authentication passed - the 404 is expected for this test token ID'
        }
      })
    }
    
    // Other errors
    if (!response.ok) {
      let errorMessage = responseText
      try {
        const errorJson = JSON.parse(responseText)
        errorMessage = errorJson.error || errorJson.message || errorJson.errorMsg || responseText
      } catch (e) {
        // Not JSON
      }
      
      return NextResponse.json({
        success: false,
        message: `API call failed: ${errorMessage}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          polyAddress: funderAddress,
          response: responseText.substring(0, 500)
        }
      }, { status: response.status })
    }
    
    // Success - try to parse the response
    let result
    try {
      result = JSON.parse(responseText)
    } catch {
      result = { raw: responseText.substring(0, 200) }
    }
    
    return NextResponse.json({
      success: true,
      message: 'API key authentication successful! ✅',
      details: {
        polyAddress: funderAddress,
        apiKeyPrefix: API_KEY.substring(0, 15) + '...',
        responsePreview: result
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to test API key',
      error: error.toString()
    }, { status: 500 })
  }
}

