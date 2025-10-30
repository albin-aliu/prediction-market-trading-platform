# Trading Architecture Guide

## Overview: How Real Trading Works

Trading on prediction markets involves **three layers**:
1. **Client-Side (Browser)** - Wallet connection & transaction signing
2. **Smart Contracts (Blockchain)** - Token approvals & settlements
3. **Trading APIs** - Order placement & matching

---

## 🔑 Key Concept: You CANNOT Execute Trades from Server

**Important:** You **cannot** execute trades directly from your Node.js server because:
- ❌ Trading requires signing transactions with a **private key**
- ❌ Users should **never** send private keys to your server (major security risk)
- ✅ Trades **must** be signed in the user's browser using their wallet (MetaMask)

**The server only provides data** (market prices, order books). **The client executes trades**.

---

## 📋 Complete Trading Flow

### **Step 1: Client-Side Wallet Connection**
```
User clicks "Connect Wallet" 
  → MetaMask popup appears
  → User approves connection
  → Wallet address stored in React state
```

**Components needed:**
- `WalletConnect.tsx` - Connect/disconnect wallet UI
- `Web3Provider.tsx` - Wagmi provider wrapper
- `lib/web3-config.ts` - Chain & connector configuration

---

### **Step 2: Approve USDC Spending**

Before trading, users must **approve** the trading contract to spend their USDC.

**On-Chain Transaction:**
```typescript
// Calls USDC smart contract
USDC.approve(
  spender: POLYMARKET_EXCHANGE_ADDRESS,
  amount: parseUnits("100", 6) // Allow spending 100 USDC
)
```

**User signs this transaction in MetaMask** → Blockchain confirms → Ready to trade

---

### **Step 3: Place Order**

Two options for order placement:

#### **Option A: Polymarket CLOB API (Recommended - Fast)**
```
Client → CLOB API → Order Book → Execution → On-chain Settlement
```

**API Call:**
```typescript
POST https://clob.polymarket.com/order
Headers:
  - POLY_ADDRESS: user's wallet address
  - POLY_SIGNATURE: signed message
  - POLY_TIMESTAMP: current timestamp
  - POLY_NONCE: unique nonce

Body: {
  "market": "0x123...",
  "side": "BUY", // or "SELL"
  "size": "10",  // number of shares
  "price": "0.65" // price per share
}
```

**Process:**
1. User's browser calls CLOB API with signed message
2. CLOB matches order with counterparties
3. Trade executes off-chain
4. Settlement happens on-chain in batches

**Speed:** ~100ms (very fast!)

---

#### **Option B: Direct Smart Contract Call (Slower)**
```
Client → Wallet → Blockchain → Smart Contract → Execution
```

**Transaction:**
```typescript
PolymarketExchange.createOrder(
  tokenId: "123",
  amount: 10,
  price: 65, // in cents
  side: BUY
)
```

**Speed:** ~30 seconds (waiting for block confirmation)

---

## 🛠️ **Components You Need to Build**

### **1. Client-Side Components**

#### `WalletConnect.tsx`
```typescript
'use client'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  // UI for connect/disconnect
}
```

#### `TradingForm.tsx`
```typescript
'use client'
import { useAccount } from 'wagmi'
import { writeContract, waitForTransactionReceipt } from 'wagmi/actions'

export function TradingForm() {
  const { address } = useAccount()
  
  const handleTrade = async () => {
    // 1. Approve USDC
    await approveUSDC()
    
    // 2. Place order via CLOB API
    await placeOrder()
  }
}
```

---

### **2. Trading Logic Files**

#### `lib/polymarket-clob.ts`
```typescript
import { ethers } from 'ethers'

export class PolymarketCLOB {
  async placeOrder(params: {
    wallet: string
    market: string
    side: 'BUY' | 'SELL'
    size: number
    price: number
  }) {
    // 1. Create order payload
    const order = {
      market: params.market,
      side: params.side,
      size: params.size.toString(),
      price: params.price.toString(),
      expiration: Date.now() + 3600000 // 1 hour
    }
    
    // 2. Sign order with wallet
    const signature = await this.signOrder(order, params.wallet)
    
    // 3. Send to CLOB API
    const response = await fetch('https://clob.polymarket.com/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'POLY_ADDRESS': params.wallet,
        'POLY_SIGNATURE': signature,
        'POLY_TIMESTAMP': Date.now().toString(),
        'POLY_NONCE': Math.random().toString()
      },
      body: JSON.stringify(order)
    })
    
    return response.json()
  }
  
  private async signOrder(order: any, wallet: string) {
    // Create EIP-712 typed data signature
    // This is signed by user's wallet in browser
  }
}
```

---

### **3. Server API Endpoints (Data Only)**

Your server provides **read-only data**, not trade execution.

#### `app/api/markets/route.ts` ✅ Already built
```typescript
// Fetches market data from PolyRouter
export async function GET() {
  const markets = await polyRouterClient.getMarkets()
  return NextResponse.json(markets)
}
```

#### `app/api/orderbook/route.ts` 🆕 Need to build
```typescript
// Fetches current order book for a market
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const marketId = searchParams.get('marketId')
  
  const orderbook = await fetch(
    `https://clob.polymarket.com/book?token_id=${marketId}`
  )
  
  return NextResponse.json(await orderbook.json())
}
```

---

## 💰 **Financial Exchange Process**

### **How Money Flows:**

```
1. User deposits USDC to Polygon network
   ↓
2. User connects wallet to your app
   ↓
3. User approves Polymarket Exchange to spend USDC
   ↓
4. User places order (BUY YES at $0.65)
   ↓
5. CLOB matches with seller
   ↓
6. Smart contract:
   - Debits buyer: 6.5 USDC (0.65 × 10 shares)
   - Debits seller: 3.5 USDC (0.35 × 10 shares)
   - Gives buyer: 10 YES tokens
   - Gives seller: 10 NO tokens
   ↓
7. When event resolves:
   - If YES wins: Buyer gets 10 USDC back
   - If NO wins: Seller gets 10 USDC back
```

### **Token System:**
- **USDC**: Stablecoin used for payment (1 USDC = $1)
- **YES/NO Tokens**: Represent positions in market
- **Each pair costs**: Always $1 total (e.g., YES at $0.60 + NO at $0.40 = $1)

---

## 🔐 **Security & Best Practices**

### ✅ **DO:**
- Store API keys in `.env` (server-side only)
- Use wallet signatures for authentication
- Validate all inputs before submitting
- Show transaction details before signing
- Handle errors gracefully

### ❌ **DON'T:**
- Store private keys anywhere
- Send private keys to your server
- Execute transactions from server
- Trust client-side data without validation
- Skip transaction confirmations

---

## 📡 **APIs You'll Call**

### **1. Polymarket CLOB API**
**Base URL:** `https://clob.polymarket.com`

**Endpoints:**
- `GET /book?token_id={id}` - Get order book
- `POST /order` - Place order
- `GET /order/{id}` - Check order status
- `DELETE /order/{id}` - Cancel order
- `GET /trades` - Get recent trades

**Authentication:** Wallet signature in headers

---

### **2. PolyRouter API** (Already integrated)
**Base URL:** `https://api.polyrouter.io/functions/v1`

**Endpoints:**
- `GET /markets-v2` - Get all markets ✅
- `GET /markets-v2/{id}` - Get specific market ✅
- `GET /price-history-v2` - Get price charts ✅

**Authentication:** `X-API-Key` header ✅

---

### **3. Polygon RPC** (Blockchain)
**Base URL:** `https://polygon-rpc.com`

**Methods:**
- `eth_sendTransaction` - Send transaction
- `eth_call` - Read contract state
- `eth_getTransactionReceipt` - Check if transaction confirmed

**Authentication:** None (public RPC)

---

## 🚀 **Implementation Priority**

### **Phase 1: Enable Trading (MVP)**
1. ✅ Fix Web3Provider (already partially done)
2. ✅ Fix WalletConnect component
3. ✅ Fix OrderForm to use real wallet
4. 🆕 Implement USDC approval flow
5. 🆕 Integrate Polymarket CLOB API
6. 🆕 Add transaction confirmation UI

### **Phase 2: Enhanced Features**
- Real-time order book display
- Trade history
- Portfolio tracking
- Price charts
- Notifications for filled orders

---

## 💡 **Quick Start Code**

Here's a minimal working example:

```typescript
// Client-side component
'use client'
import { useAccount } from 'wagmi'
import { writeContract } from 'wagmi/actions'

export function QuickTrade() {
  const { address } = useAccount()
  
  const executeTrade = async () => {
    // 1. Approve USDC
    const approveTx = await writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [POLYMARKET_EXCHANGE, parseUnits('100', 6)]
    })
    
    // 2. Wait for approval
    await waitForTransaction({ hash: approveTx })
    
    // 3. Place order via CLOB
    const order = await fetch('https://clob.polymarket.com/order', {
      method: 'POST',
      headers: {
        'POLY_ADDRESS': address,
        'POLY_SIGNATURE': await signMessage('Place order')
      },
      body: JSON.stringify({
        market: '0x123...',
        side: 'BUY',
        size: '10',
        price: '0.65'
      })
    })
    
    console.log('Order placed:', await order.json())
  }
  
  return <button onClick={executeTrade}>Trade Now</button>
}
```

---

## 📚 **Additional Resources**

- [Polymarket CLOB Docs](https://docs.polymarket.com)
- [Wagmi Documentation](https://wagmi.sh)
- [EIP-712 Signatures](https://eips.ethereum.org/EIPS/eip-712)
- [USDC Contract on Polygon](https://polygonscan.com/token/0x2791bca1f2de4661ed88a30c99a7a9449aa84174)

---

## ❓ **FAQs**

**Q: Can I trade without connecting a wallet?**
A: No. All trades require wallet signatures for security.

**Q: Why use CLOB API instead of direct blockchain calls?**
A: CLOB is 100x faster (~100ms vs ~30s) and has better liquidity.

**Q: Do I need to run my own blockchain node?**
A: No. Use public RPCs like Polygon's or Alchemy.

**Q: How much does a trade cost?**
A: ~$0.01-0.05 in gas fees on Polygon (very cheap).

**Q: Can I automate trading with bots?**
A: Yes, but you'd need a funded wallet and automated signing.

---

**Next:** Would you like me to implement the complete trading flow with real wallet integration?

