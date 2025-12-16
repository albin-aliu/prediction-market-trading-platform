#!/usr/bin/env node

/**
 * Test to see exactly what we're sending to Polymarket
 * This will call a debug endpoint that shows the request details
 */

const http = require('http');

// First, let's create an endpoint that shows what we WOULD send
// But for now, let's just make the actual request and log what happens

const testData = {
  order: {
    salt: '1234567890123456789012345678901234567890123456789012345678901234',
    maker: '0x9D3bcE1316a56f685A05052FcF69bef4c097C394',
    signer: '0x9D3bcE1316a56f685A05052FcF69bef4c097C394',
    taker: '0x0000000000000000000000000000000000000000',
    tokenId: '64752768068751003284591786845158970622611273424843556508270903047927272044122',
    makerAmount: '5000000',
    takerAmount: '9708737',
    expiration: (Math.floor(Date.now() / 1000) + 3600).toString(),
    nonce: '0',
    feeRateBps: '0',
    side: 0,
    signatureType: 0
  },
  signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
  walletAddress: '0x9D3bcE1316a56f685A05052FcF69bef4c097C394'
};

console.log('🔍 Configuration Check:');
console.log('  Expected POLY_ADDRESS: 0x91c462f1e3ded4a3CF1Ec8199791088ab732f82f (proxy wallet)');
console.log('  API Key prefix: 019af62e-5921-7...');
console.log('  Order maker/signer: 0x9D3bcE... (MetaMask wallet)');
console.log('  Order signatureType: 0 (EOA)');
console.log('');
console.log('⚠️ POTENTIAL ISSUE:');
console.log('  - Order has signatureType: 0 (EOA)');
console.log('  - But we\'re using proxy wallet (should be signatureType: 2)');
console.log('  - Order maker/signer is MetaMask, not proxy wallet');
console.log('  - This mismatch might be causing the error!');
console.log('');
console.log('📤 Making request to see full error...\n');

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/trade/submit',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('📥 Response:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.errorDetails) {
        console.log('\n🔍 Full Error Analysis:');
        console.log('  Status:', result.errorDetails.status);
        console.log('  Full Response:', result.errorDetails.fullResponse);
        console.log('  Parsed Error:', JSON.stringify(result.errorDetails.parsedError, null, 2));
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(postData);
req.end();


