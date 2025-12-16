#!/usr/bin/env node

/**
 * Debug script to see exactly what's being sent to Polymarket
 */

try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv not installed
}

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000'

async function testOrderSubmit() {
  console.log('🧪 Testing Order Submission\n')
  console.log('This will show you exactly what is being sent to Polymarket\n')
  
  // Use a test order payload
  const testPayload = {
    order: {
      salt: '1234567890',
      maker: '0x91c462f1e3ded4a3CF1Ec8199791088ab732f82f',
      signer: '0x91c462f1e3ded4a3CF1Ec8199791088ab732f82f',
      taker: '0x0000000000000000000000000000000000000000',
      tokenId: '60487116984468020978247225474488676749601001829886755968952521846780452448915',
      makerAmount: '5500',
      takerAmount: '1000000',
      side: 'BUY',
      expiration: (Math.floor(Date.now() / 1000) + 3600).toString(),
      nonce: '0',
      feeRateBps: '0',
      signatureType: 2,
      signature: '0x' + '0'.repeat(130) // Dummy signature
    },
    signature: '0x' + '0'.repeat(130),
    walletAddress: '0x9D3bcE1316a56f685A05052FcF69bef4c097C394'
  }
  
  console.log('Sending test request to:', SERVER_URL + '/api/trade/submit')
  console.log('Payload:', JSON.stringify(testPayload, null, 2))
  console.log('')
  
  try {
    const response = await fetch(SERVER_URL + '/api/trade/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    })
    
    const responseText = await response.text()
    console.log('Response Status:', response.status)
    console.log('Response:', responseText)
    
    try {
      const json = JSON.parse(responseText)
      console.log('\nParsed Response:')
      console.log(JSON.stringify(json, null, 2))
      
      if (json.errorDetails) {
        console.log('\n📋 Error Details:')
        console.log('  POLY_ADDRESS:', json.errorDetails.polyAddress)
        console.log('  owner field:', json.errorDetails.ownerField)
        console.log('  Full response:', json.errorDetails.fullResponse?.substring(0, 500))
      }
    } catch (e) {
      console.log('Response is not JSON')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
    console.error('Make sure your dev server is running: npm run dev')
  }
}

testOrderSubmit()

