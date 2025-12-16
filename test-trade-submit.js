#!/usr/bin/env node

/**
 * Test script to verify trade submission endpoint
 * Tests POLY_ADDRESS header and API authentication
 */

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/trade/submit';

// Sample data matching what the frontend would send
const testData = {
  order: {
    salt: '1234567890123456789012345678901234567890123456789012345678901234',
    maker: '0x9D3bcE1316a56f685A05052FcF69bef4c097C394', // MetaMask wallet
    signer: '0x9D3bcE1316a56f685A05052FcF69bef4c097C394', // MetaMask wallet
    taker: '0x0000000000000000000000000000000000000000',
    tokenId: '64752768068751003284591786845158970622611273424843556508270903047927272044122',
    makerAmount: '5000000', // $5 USDC
    takerAmount: '9708737', // Shares
    expiration: (Math.floor(Date.now() / 1000) + 3600).toString(),
    nonce: '0',
    feeRateBps: '0',
    side: 0, // BUY
    signatureType: 0 // EOA
  },
  signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
  walletAddress: '0x9D3bcE1316a56f685A05052FcF69bef4c097C394' // MetaMask wallet
};

async function testTradeSubmit() {
  console.log('🧪 Testing Trade Submit Endpoint\n');
  console.log('Test Data:');
  console.log('  - Signing Wallet (MetaMask):', testData.walletAddress);
  console.log('  - Order Maker/Signer:', testData.order.maker);
  console.log('  - Token ID:', testData.order.tokenId);
  console.log('  - Side: BUY');
  console.log('  - Amount: $5 USDC\n');

  try {
    console.log('📤 Sending POST request to:', API_URL);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('\n📥 Response Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('📥 Response Body:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('\n📋 Parsed Response:');
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('\n⚠️ Could not parse response as JSON');
    }

    // Check what POLY_ADDRESS would be used
    console.log('\n🔍 Expected Behavior:');
    console.log('  - POLY_ADDRESS should be:', process.env.POLYMARKET_FUNDER || testData.walletAddress);
    console.log('  - API Key is for:', process.env.POLYMARKET_FUNDER || 'MetaMask wallet');
    
    if (result && result.errorDetails) {
      console.log('\n❌ Error Details:');
      console.log('  - Type:', result.errorDetails.type);
      console.log('  - Message:', result.errorDetails.message);
      if (result.errorDetails.response) {
        console.log('  - Response:', JSON.stringify(result.errorDetails.response, null, 2));
      }
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testTradeSubmit();


