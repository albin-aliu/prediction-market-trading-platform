#!/usr/bin/env node

/**
 * Verbose test to see what POLY_ADDRESS is actually being sent
 */

const http = require('http');

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

console.log('🧪 Testing with verbose output\n');
console.log('Request to:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Test wallet (MetaMask):', testData.walletAddress);
console.log('Expected POLY_ADDRESS (from .env.local): 0x91c462f1e3ded4a3CF1Ec8199791088ab732f82f\n');

const req = http.request(options, (res) => {
  console.log(`📥 Status: ${res.statusCode} ${res.statusMessage}`);
  console.log('📥 Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📥 Response Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
    console.log('\n💡 Check the server terminal for detailed logs showing:');
    console.log('   - What POLY_ADDRESS was actually sent');
    console.log('   - What API key was used');
    console.log('   - The full error response from Polymarket');
  });
});

req.on('error', (e) => {
  console.error(`❌ Problem with request: ${e.message}`);
});

req.write(postData);
req.end();


