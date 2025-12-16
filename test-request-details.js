#!/usr/bin/env node

/**
 * Test script to see the exact request being sent to Polymarket
 */

const { ethers } = require('ethers')

// Load environment variables
try {
  require('dotenv').config({ path: '.env.local' })
} catch (e) {
  // dotenv not installed
}

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000'
const PRIVATE_KEY = process.env.TRADING_PRIVATE_KEY

async function testRequest() {
  try {
    if (!PRIVATE_KEY) {
      throw new Error('TRADING_PRIVATE_KEY not set')
    }

    const wallet = new ethers.Wallet(PRIVATE_KEY)
    const walletAddress = wallet.address

    console.log('🔐 Wallet Address:', walletAddress)
    console.log('')

    // Step 1: Prepare order
    console.log('📝 Step 1: Preparing order...')
    const prepareResponse = await fetch(`${SERVER_URL}/api/trade/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        tokenId: '104173557214744537570424345347209544585775842950109756851652855913015295701992',
        side: 'BUY',
        size: '1',
        price: '0.0065'
      })
    })

    if (!prepareResponse.ok) {
      const errorText = await prepareResponse.text()
      throw new Error(`Prepare failed: ${prepareResponse.status} - ${errorText}`)
    }

    const orderData = await prepareResponse.json()
    if (!orderData.success) {
      throw new Error(`Prepare failed: ${orderData.message}`)
    }

    console.log('✅ Order prepared')
    console.log('   Maker:', orderData.order.maker)
    console.log('   Signer:', orderData.order.signer)
    console.log('   Signature Type:', orderData.order.signatureType)
    console.log('')

    // Step 2: Sign order
    console.log('✍️  Step 2: Signing order...')
    const orderForSigning = {
      salt: orderData.order.salt,
      maker: orderData.order.maker,
      signer: orderData.order.signer,
      taker: orderData.order.taker,
      tokenId: orderData.order.tokenId,
      makerAmount: orderData.order.makerAmount,
      takerAmount: orderData.order.takerAmount,
      expiration: orderData.order.expiration,
      nonce: orderData.order.nonce,
      feeRateBps: orderData.order.feeRateBps,
      side: orderData.order.side,
      signatureType: orderData.order.signatureType
    }

    const signature = await wallet.signTypedData(
      orderData.domain,
      orderData.types,
      orderForSigning
    )

    console.log('✅ Order signed')
    console.log('')

    // Step 3: Submit order (this will show detailed logs on server)
    console.log('📤 Step 3: Submitting order to Polymarket...')
    console.log('   (Check your server terminal for detailed request logs)')
    console.log('')
    
    const submitResponse = await fetch(`${SERVER_URL}/api/trade/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: orderData.order,
        signature,
        walletAddress
      })
    })

    const result = await submitResponse.json()
    
    console.log('📋 Response from server:')
    console.log(JSON.stringify(result, null, 2))
    
    if (result.errorDetails) {
      console.log('')
      console.log('🔍 Error Details:')
      console.log('  Status:', result.errorDetails.status)
      console.log('  POLY_ADDRESS used:', result.errorDetails.polyAddress)
      console.log('  Owner field (API KEY):', result.errorDetails.ownerField)
      console.log('  Order Maker:', result.errorDetails.orderMaker)
      console.log('  Order Signer:', result.errorDetails.orderSigner)
      console.log('  Full Response:', result.errorDetails.fullResponse)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
  }
}

testRequest()

