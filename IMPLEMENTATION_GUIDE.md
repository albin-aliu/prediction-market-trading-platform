# 🚀 Trading Implementation Guide

## TL;DR - What You Need to Know

### **Key Points:**
1. ⚠️ **You CANNOT execute trades from your Node.js server** - trades must be signed by the user's wallet in their browser
2. ✅ **Your server provides data** (market prices, order books, etc.)
3. ✅ **Your client executes trades** (user signs transactions in MetaMask)
4. 🔐 **Security:** Never ask users for private keys or seed phrases

---

## 📊 **System Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR PLATFORM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                      ┌──────────────┐         │
│  │   Browser    │                      │  Next.js     │         │
│  │  (Client)    │◄────────────────────►│  Server      │         │
│  │              │    GET market data   │              │         │
│  └──────┬───────┘                      └──────┬───────┘         │
│         │                                     │                  │
│         │ Signs transactions                  │ Fetches data     │
│         │ (MetaMask)                          │ only             │
│         │                                     │                  │
└─────────┼─────────────────────────────────────┼──────────────────┘
          │                                     │
          ▼                                     ▼
┌─────────────────────┐            ┌───────────────────────┐
│  Polymarket CLOB    │            │   PolyRouter API      │
│  (Order Matching)   │            │   (Market Data)       │
│                     │            │                       │
│  - Place order      │            │  - Get markets        │
│  - Cancel order     │            │  - Get prices         │
│  - Get order book   │            │  - Get history        │
└─────────┬───────────┘            └───────────────────────┘
          │
          │ Settles trades
          ▼
┌─────────────────────┐
│  Polygon Blockchain │
│  (Smart Contracts)  │
│                     │
│  - USDC transfers   │
│  - Token minting    │
│  - Settlements      │
└─────────────────────┘
```

---

## 🔄 **Complete Trade Execution Flow**

### **Scenario: User wants to buy 10 YES shares at $0.65 each**

```
Step 1: USER CONNECTS WALLET
└─► User clicks "Connect Wallet"
    └─► MetaMask opens
        └─► User approves connection
            └─► App gets user's address (0x742d...)

Step 2: FETCH MARKET DATA (Server-side)
└─► Browser → GET /api/markets
    └─► Server → PolyRouter API
        └─► Server returns markets to browser
            └─► User selects market

Step 3: USER APPROVES USDC SPENDING (One-time)
└─► User clicks "Approve USDC"
    └─► App calls USDC.approve(POLYMARKET_EXCHANGE, amount)
        └─► MetaMask opens: "Approve USDC spending"
            └─► User signs transaction
                └─► Wait for blockchain confirmation (~2s)
                    └─► ✅ Approved!

Step 4: USER PLACES ORDER
└─► User fills order form:
    • Market: "Trump wins 2024"
    • Side: YES
    • Amount: 10 shares
    • Price: $0.65/share
    └─► User clicks "Place Order"
        └─► App sends to Polymarket CLOB API:
            POST /order {
              market: "0x123...",
              side: "BUY",
              size: 10,
              price: 0.65
            }
            └─► CLOB matches with sellers
                └─► Trade executes instantly (~100ms)
                    └─► Smart contract settles on-chain
                        └─► ✅ User receives 10 YES tokens!

Step 5: USER CHECKS POSITION
└─► Browser → GET /api/portfolio?address=0x742d...
    └─► Server checks blockchain
        └─► Returns: 10 YES tokens worth $6.50
```

---

## 💻 **Actual Implementation Code**

### **1. Environment Variables (.env)**
```bash
# Already set up:
POLYROUTER_API_KEY=pk_e9b83eeafe28677b455b647303f179733aa4cb1513425b0c87952db5967ca013

# You need to add:
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_key_here  # Get free at alchemy.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id  # Optional
```

---

### **2. Client-Side: Complete Trading Component**

Create `components/RealTrading.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { writeContract, waitForTransactionReceipt } from 'wagmi/actions'
import { config } from '@/lib/web3-config'
import { parseUnits, formatUnits } from 'viem'
import { polygon } from 'wagmi/chains'

// Polygon USDC contract
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'

// Polymarket Exchange (hypothetical - use real address)
const POLYMARKET_EXCHANGE = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E'

// Minimal USDC ABI
const USDC_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function'
  }
] as const

export function RealTrading() {
  const { address, isConnected } = useAccount()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  // Step 1: Approve USDC
  const approveUSDC = async () => {
    if (!address) return
    
    try {
      setLoading(true)
      setStatus('Approving USDC...')
      
      const amount = parseUnits('1000', 6) // Approve 1000 USDC
      
      const hash = await writeContract(config, {
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [POLYMARKET_EXCHANGE, amount],
        chainId: polygon.id,
      })
      
      setStatus('Waiting for confirmation...')
      await waitForTransactionReceipt(config, { hash })
      
      setStatus('✅ USDC approved! Ready to trade.')
    } catch (error) {
      console.error('Approval failed:', error)
      setStatus(`❌ Approval failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Place order via CLOB
  const placeOrder = async () => {
    if (!address) return
    
    try {
      setLoading(true)
      setStatus('Placing order...')
      
      // Create order payload
      const order = {
        market: '0x123...', // Market ID
        side: 'BUY',
        size: '10',
        price: '0.65',
        maker: address,
        expiration: Math.floor(Date.now() / 1000) + 3600 // 1 hour
      }
      
      // In real implementation, you'd sign this order with EIP-712
      // For now, this is pseudocode
      const response = await fetch('https://clob.polymarket.com/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'POLY_ADDRESS': address,
          // In reality, you'd need to sign the order
        },
        body: JSON.stringify(order)
      })
      
      const result = await response.json()
      setStatus(`✅ Order placed! ID: ${result.orderID}`)
    } catch (error) {
      console.error('Order failed:', error)
      setStatus(`❌ Order failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-800 font-semibold">
          ⚠️ Connect your wallet to start trading
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-green-800 font-semibold">
          ✅ Wallet connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={approveUSDC}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? 'Processing...' : '1. Approve USDC'}
        </button>

        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? 'Processing...' : '2. Place Order'}
        </button>
      </div>

      {status && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm">{status}</p>
        </div>
      )}
    </div>
  )
}
```

---

### **3. Server API: Order Book Data**

Create `app/api/orderbook/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('tokenId')
    
    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID required' },
        { status: 400 }
      )
    }

    // Fetch order book from Polymarket CLOB
    const response = await fetch(
      `https://clob.polymarket.com/book?token_id=${tokenId}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch order book')
    }

    const orderbook = await response.json()

    return NextResponse.json({
      bids: orderbook.bids || [], // Buy orders
      asks: orderbook.asks || [], // Sell orders
      spread: calculateSpread(orderbook),
      lastUpdate: new Date().toISOString()
    })
  } catch (error) {
    console.error('Order book error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order book' },
      { status: 500 }
    )
  }
}

function calculateSpread(orderbook: any) {
  const bestBid = orderbook.bids?.[0]?.price || 0
  const bestAsk = orderbook.asks?.[0]?.price || 0
  return bestAsk - bestBid
}
```

---

### **4. Utility: Polymarket CLOB Client**

Create `lib/polymarket-clob-client.ts`:

```typescript
import { type Address } from 'viem'

export interface OrderParams {
  tokenId: string
  side: 'BUY' | 'SELL'
  size: number
  price: number
  maker: Address
}

export interface Order {
  orderId: string
  status: 'PENDING' | 'FILLED' | 'CANCELLED'
  fillAmount: number
  remainingSize: number
}

export class PolymarketCLOBClient {
  private baseUrl = 'https://clob.polymarket.com'

  async getOrderBook(tokenId: string) {
    const response = await fetch(`${this.baseUrl}/book?token_id=${tokenId}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch order book: ${response.statusText}`)
    }
    
    return response.json()
  }

  async placeOrder(params: OrderParams): Promise<Order> {
    // In production, you'd need to:
    // 1. Create EIP-712 signature
    // 2. Send signed order to CLOB
    
    const response = await fetch(`${this.baseUrl}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'POLY_ADDRESS': params.maker,
        // 'POLY_SIGNATURE': signature,
        // 'POLY_TIMESTAMP': timestamp,
        // 'POLY_NONCE': nonce
      },
      body: JSON.stringify({
        token_id: params.tokenId,
        side: params.side,
        size: params.size.toString(),
        price: params.price.toString(),
        maker: params.maker
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to place order: ${response.statusText}`)
    }

    return response.json()
  }

  async cancelOrder(orderId: string, maker: Address) {
    const response = await fetch(`${this.baseUrl}/order/${orderId}`, {
      method: 'DELETE',
      headers: {
        'POLY_ADDRESS': maker,
        // 'POLY_SIGNATURE': signature
      }
    })

    return response.json()
  }

  async getOrderStatus(orderId: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/order/${orderId}`)
    return response.json()
  }
}
```

---

## 🔑 **Smart Contract Addresses (Polygon)**

```typescript
// lib/contracts.ts

export const CONTRACTS = {
  // Polygon Mainnet
  USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  
  // Polymarket (You need to find official addresses)
  POLYMARKET_EXCHANGE: '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E',
  POLYMARKET_CONDITIONAL_TOKENS: '0x...',
  
  // Testnet (Polygon Mumbai) for testing
  USDC_TESTNET: '0x...'
}

export const CHAIN_IDS = {
  POLYGON: 137,
  POLYGON_MUMBAI: 80001
}
```

---

## 📋 **API Endpoints Summary**

### **Your Server (Read-Only)**
```
GET  /api/markets          → Get all markets
GET  /api/markets/[id]     → Get specific market
GET  /api/arbitrage        → Find arbitrage opportunities
GET  /api/orderbook        → Get order book for market
GET  /api/portfolio        → Get user's positions
```

### **Polymarket CLOB (Client calls directly)**
```
POST   /order              → Place new order
DELETE /order/[id]         → Cancel order
GET    /order/[id]         → Get order status
GET    /book               → Get order book
GET    /trades             → Get recent trades
```

### **PolyRouter (Server calls)**
```
GET /markets-v2            → Market data
GET /price-history-v2      → Price charts
```

---

## ⚡ **Next Steps to Enable Real Trading**

### **Immediate (Required for MVP):**
1. ✅ Restore Web3Provider and WalletConnect components
2. ✅ Update OrderForm to use real wallet connection
3. 🆕 Add USDC approval flow
4. 🆕 Integrate Polymarket CLOB API calls
5. 🆕 Add transaction status feedback

### **Important (For Production):**
6. Add proper error handling
7. Show gas fee estimates
8. Add transaction history
9. Implement EIP-712 signing
10. Add loading states and confirmations

### **Nice to Have:**
11. Real-time order book updates
12. Price charts
13. Trade notifications
14. Portfolio analytics
15. Stop-loss orders

---

## 💡 **Key Takeaways**

1. **Client signs, server provides data** - This is the most important concept
2. **USDC approval is required first** - One-time transaction before trading
3. **CLOB API is fast** - ~100ms vs ~30s for direct blockchain calls
4. **Always show transaction details** - Let users know what they're signing
5. **Handle errors gracefully** - Network issues, insufficient funds, etc.

---

## 🚨 **Common Pitfalls to Avoid**

❌ **DON'T:**
- Execute trades from your server
- Store private keys
- Skip transaction confirmations
- Hide transaction details from users
- Use testnet addresses in production

✅ **DO:**
- Let users sign all transactions
- Show clear transaction previews
- Wait for blockchain confirmations
- Handle errors with helpful messages
- Test on testnet first

---

Would you like me to implement any of these components next?

