#!/usr/bin/env node

/**
 * Test script to verify API key configuration
 */

try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv not installed
}

const API_KEY = process.env.POLYMARKET_API_KEY
const API_SECRET = process.env.POLYMARKET_SECRET
const API_PASSPHRASE = process.env.POLYMARKET_PASSPHRASE
const POLYMARKET_FUNDER = process.env.POLYMARKET_FUNDER
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000'

console.log('🔍 API Configuration Check\n')
console.log('Environment Variables:')
console.log('  POLYMARKET_API_KEY:', API_KEY ? API_KEY.substring(0, 15) + '...' : '❌ NOT SET')
console.log('  POLYMARKET_SECRET:', API_SECRET ? '✅ SET (' + API_SECRET.length + ' chars)' : '❌ NOT SET')
console.log('  POLYMARKET_PASSPHRASE:', API_PASSPHRASE ? '✅ SET (' + API_PASSPHRASE.length + ' chars)' : '❌ NOT SET')
console.log('  POLYMARKET_FUNDER:', POLYMARKET_FUNDER || '❌ NOT SET (will use signing wallet)')
console.log('')

const funderAddress = POLYMARKET_FUNDER || 'NOT_SET'

console.log('📋 Expected Configuration:')
console.log('  POLY_ADDRESS header will be:', funderAddress)
console.log('  owner field in order will be:', funderAddress)
console.log('  ⚠️  API key MUST be generated for wallet:', funderAddress)
console.log('')

console.log('🧪 Testing API authentication...')
console.log('  Calling:', SERVER_URL + '/api/trade/test-api-key')
console.log('')

fetch(SERVER_URL + '/api/trade/test-api-key')
  .then(res => res.json())
  .then(data => {
    console.log('Response:')
    console.log(JSON.stringify(data, null, 2))
    
    if (data.success) {
      console.log('\n✅ API key authentication is working!')
    } else {
      console.log('\n❌ API key authentication failed')
      if (data.details && data.details.troubleshooting) {
        console.log('\nTroubleshooting steps:')
        data.details.troubleshooting.checks.forEach((check, i) => {
          console.log('  ' + check)
        })
      }
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message)
    console.error('  Make sure your dev server is running: npm run dev')
  })

