# 🔐 Wallet Integration & Real Trading Plan

## 🚨 Important: Phantom Wallet Won't Work!

**Phantom** is a **Solana** wallet.  
**Polymarket** runs on **Polygon** (Ethereum Layer 2).

### ✅ Compatible Wallets for Polymarket:
- **MetaMask** (most popular)
- **WalletConnect** (mobile-friendly)
- **Rainbow Wallet**
- **Coinbase Wallet**
- **Trust Wallet**

---

## 🎯 Implementation Plan

### Phase 1: Wallet Connection (2-3 hours)
- [ ] Set up wagmi v2 configuration
- [ ] Add wallet connection UI
- [ ] Connect to Polygon network
- [ ] Display wallet address & balance
- [ ] Show USDC balance

### Phase 2: USDC Setup (1-2 hours)
- [ ] Add USDC token to wallet
- [ ] Get test USDC on Polygon testnet
- [ ] Implement USDC approval flow
- [ ] Show allowance status

### Phase 3: Polymarket Integration (4-6 hours)
- [ ] Connect to Polymarket CLOB API
- [ ] Implement order creation
- [ ] Sign orders with wallet
- [ ] Submit orders to orderbook
- [ ] Handle order status

### Phase 4: UI/UX Polish (2-3 hours)
- [ ] Transaction confirmations
- [ ] Error handling
- [ ] Loading states
- [ ] Success notifications
- [ ] Order history

**Total Estimated Time:** 10-15 hours

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND (Browser)                                      │
│                                                          │
│  1. User clicks "Connect Wallet"                        │
│     ↓                                                    │
│  2. MetaMask popup appears                              │
│     ↓                                                    │
│  3. User approves connection                            │
│     ↓                                                    │
│  4. App gets wallet address                             │
│     ↓                                                    │
│  5. Check USDC balance                                  │
│     ↓                                                    │
│  6. User enters trade details                           │
│     ↓                                                    │
│  7. Approve USDC spending (one-time)                    │
│     ↓                                                    │
│  8. Sign order with wallet                              │
│     ↓                                                    │
│  9. Submit order to Polymarket                          │
│                                                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│ POLYGON BLOCKCHAIN                                      │
│                                                          │
│  Smart Contracts:                                       │
│  ├── USDC Token Contract (approve spending)             │
│  ├── Polymarket CLOB Contract (submit orders)          │
│  └── Conditional Tokens (CTF) Contract                  │
│                                                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────┐
│ POLYMARKET ORDERBOOK                                    │
│                                                          │
│  - Receives signed order                                │
│  - Validates signature                                  │
│  - Matches with counterparty                            │
│  - Executes trade                                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📋 Step-by-Step Implementation

### Step 1: Install Dependencies (Already Done!)

```bash
# You already have these:
npm install wagmi viem @tanstack/react-query

# Additional needed:
npm install @polymarket/clob-client
npm install ethers@6
```

### Step 2: Configure Web3 (Update Existing)

```typescript
// lib/web3-config.ts
import { http, createConfig } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// WalletConnect project ID (get from https://cloud.walletconnect.com)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

export const config = createConfig({
  chains: [polygon, polygonMumbai], // Mainnet and testnet
  connectors: [
    injected(), // MetaMask, Coinbase Wallet, etc.
    walletConnect({ projectId }), // Mobile wallets
  ],
  transports: {
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
  },
})

// Contract addresses
export const POLYGON_USDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
export const POLYMARKET_CLOB = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E'
export const CTF_EXCHANGE = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E'
```

### Step 3: Create Wallet Connect Component

```typescript
// components/WalletConnect.tsx
'use client'

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { formatUnits } from 'viem'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
  })

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        {/* USDC Balance */}
        <div className="text-sm">
          <span className="text-gray-500">USDC:</span>
          <span className="font-semibold ml-2">
            ${usdcBalance ? formatUnits(usdcBalance.value, 6) : '0.00'}
          </span>
        </div>
        
        {/* Address */}
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        
        {/* Disconnect */}
        <button
          onClick={() => disconnect()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
  )
}
```

### Step 4: Wrap App with Web3 Provider

```typescript
// app/layout.tsx
import { Web3Provider } from '@/components/Web3Provider'
import { WalletConnect } from '@/components/WalletConnect'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Web3Provider>
          <nav>
            <h1>Prediction Market Trader</h1>
            <WalletConnect /> {/* Add wallet button to nav */}
          </nav>
          
          <main>{children}</main>
        </Web3Provider>
      </body>
    </html>
  )
}
```

### Step 5: Create Trading Hook

```typescript
// lib/hooks/usePolymarketTrade.ts
'use client'

import { useAccount, useWriteContract, useWaitForTransaction } from 'wagmi'
import { parseUnits } from 'viem'
import { ClobClient } from '@polymarket/clob-client'

export function usePolymarketTrade() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  // Initialize Polymarket CLOB client
  const clob = new ClobClient({
    chainId: 137, // Polygon mainnet
    host: 'https://clob.polymarket.com',
  })

  // Step 1: Approve USDC spending
  async function approveUSDC(amount: string) {
    const amountWei = parseUnits(amount, 6) // USDC has 6 decimals
    
    return writeContract({
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
      abi: [
        {
          name: 'approve',
          type: 'function',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }]
        }
      ],
      functionName: 'approve',
      args: ['0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E', amountWei], // Polymarket CLOB
    })
  }

  // Step 2: Place order
  async function placeOrder(params: {
    tokenId: string      // Market token ID
    side: 'BUY' | 'SELL'
    amount: string        // Number of shares
    price: number         // Price (0-1)
  }) {
    if (!address) throw new Error('Wallet not connected')

    // Create order
    const order = await clob.createOrder({
      tokenID: params.tokenId,
      side: params.side,
      price: params.price,
      size: parseFloat(params.amount),
      feeRateBps: '200', // 2% fee
    })

    // Sign order with wallet
    const signature = await clob.signOrder(order, address)

    // Submit to orderbook
    const result = await clob.postOrder(order, signature)

    return result
  }

  return {
    approveUSDC,
    placeOrder,
    isConnected: !!address,
    address,
  }
}
```

### Step 6: Update OrderForm Component

```typescript
// components/OrderForm.tsx
'use client'

import { useState } from 'react'
import { usePolymarketTrade } from '@/lib/hooks/usePolymarketTrade'
import { useAccount } from 'wagmi'

export function OrderForm() {
  const { address, isConnected } = useAccount()
  const { approveUSDC, placeOrder } = usePolymarketTrade()
  const [loading, setLoading] = useState(false)
  const [approved, setApproved] = useState(false)

  // Form state
  const [amount, setAmount] = useState('10')
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [outcome, setOutcome] = useState<'YES' | 'NO'>('YES')

  async function handleApprove() {
    setLoading(true)
    try {
      await approveUSDC('1000') // Approve $1000 USDC
      setApproved(true)
      alert('✅ USDC approved! You can now place orders.')
    } catch (error) {
      alert('❌ Approval failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!approved) {
      alert('Please approve USDC first')
      return
    }

    setLoading(true)
    try {
      const result = await placeOrder({
        tokenId: 'selected_market_token_id', // Get from selected market
        side: side,
        amount: amount,
        price: outcome === 'YES' ? 0.65 : 0.35, // Example prices
      })

      alert('✅ Order placed! ID: ' + result.orderID)
    } catch (error) {
      alert('❌ Order failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-lg">
        <p className="text-lg font-semibold mb-4">
          🔒 Connect your wallet to start trading
        </p>
        <p className="text-sm text-gray-600">
          Click "Connect Wallet" in the navigation bar
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step 1: Approve USDC */}
      {!approved && (
        <div className="mb-6 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Step 1: Approve USDC</h3>
          <p className="text-sm text-gray-600 mb-4">
            One-time approval to let Polymarket spend your USDC
          </p>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Approving...' : 'Approve USDC'}
          </button>
        </div>
      )}

      {/* Step 2: Place Order */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-6">Place Order</h3>

        {/* Outcome Selection */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Outcome</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setOutcome('YES')}
              className={`py-3 rounded-lg font-semibold ${
                outcome === 'YES'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100'
              }`}
            >
              YES
            </button>
            <button
              onClick={() => setOutcome('NO')}
              className={`py-3 rounded-lg font-semibold ${
                outcome === 'NO'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100'
              }`}
            >
              NO
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Amount (USDC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-lg"
            placeholder="10"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !approved}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 rounded-lg disabled:opacity-50"
        >
          {loading ? '⏳ Placing Order...' : '✅ Place Order'}
        </button>
      </div>
    </div>
  )
}
```

---

## 🔐 Security Considerations

### 1. **Never Store Private Keys**
```typescript
// ❌ NEVER do this:
const privateKey = '0x123...'

// ✅ Always let wallet handle signing:
const signature = await walletClient.signMessage({ message })
```

### 2. **Validate User Input**
```typescript
// Prevent invalid amounts
if (parseFloat(amount) <= 0) {
  throw new Error('Amount must be positive')
}

// Prevent spending more than balance
if (parseFloat(amount) > balance) {
  throw new Error('Insufficient balance')
}
```

### 3. **Use Environment Variables**
```bash
# .env.local (NEVER commit this!)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key_here
```

---

## 💰 Getting Started (Testnet First!)

### Step 1: Switch to Polygon Mumbai (Testnet)
```typescript
// In wallet
Network: Polygon Mumbai Testnet
RPC: https://rpc-mumbai.maticvigil.com
Chain ID: 80001
```

### Step 2: Get Test MATIC
- Visit: https://faucet.polygon.technology
- Paste your wallet address
- Get free test MATIC

### Step 3: Get Test USDC
```typescript
// Use Aave faucet or Polygon faucet
// Request test USDC tokens
```

### Step 4: Test Your Integration
1. Connect wallet ✅
2. Approve USDC ✅
3. Place small test order ✅
4. Verify on Polygonscan ✅

### Step 5: Move to Mainnet
Once everything works on testnet:
```typescript
// Switch to mainnet
chains: [polygon] // Remove polygonMumbai
```

---

## 📊 Polymarket CLOB API

### Key Endpoints:

```typescript
// 1. Get market orderbook
GET /book?token_id={tokenId}

// 2. Create order
POST /order
{
  "tokenID": "123...",
  "price": 0.65,
  "size": 10,
  "side": "BUY",
  "signature": "0x..."
}

// 3. Cancel order
DELETE /order/{orderId}

// 4. Get user orders
GET /orders?user={address}
```

---

## 🎯 Complete Trading Flow

```
1. User connects MetaMask
   ↓
2. Check USDC balance
   ↓
3. Select market & outcome (YES/NO)
   ↓
4. Enter amount
   ↓
5. Approve USDC (one-time)
   ├─ User signs approval transaction
   ├─ Wait for confirmation
   └─ USDC now spendable by Polymarket
   ↓
6. Create order
   ├─ Calculate price & fees
   ├─ Create order object
   └─ Sign order with wallet
   ↓
7. Submit to Polymarket CLOB
   ├─ POST signed order
   ├─ Orderbook matches
   └─ Trade executes
   ↓
8. Show confirmation
   ├─ Display transaction hash
   ├─ Link to Polygonscan
   └─ Update user balance
```

---

## 🚀 Quick Start Checklist

### Prerequisites:
- [ ] MetaMask installed (https://metamask.io)
- [ ] MATIC tokens (for gas fees)
- [ ] USDC tokens (for trading)
- [ ] WalletConnect project ID

### Implementation:
- [ ] Install `@polymarket/clob-client`
- [ ] Update `lib/web3-config.ts`
- [ ] Create `usePolymarketTrade` hook
- [ ] Update `WalletConnect` component
- [ ] Update `OrderForm` component
- [ ] Test on Mumbai testnet
- [ ] Deploy to mainnet

---

## 📚 Resources

### Documentation:
- Polymarket CLOB: https://docs.polymarket.com
- Wagmi v2: https://wagmi.sh
- WalletConnect: https://walletconnect.com
- Polygon: https://polygon.technology

### Getting Help:
- Polymarket Discord: https://discord.gg/polymarket
- wagmi GitHub: https://github.com/wevm/wagmi

---

## 🎯 Next Steps

1. **Get WalletConnect Project ID**
   - Go to https://cloud.walletconnect.com
   - Create free account
   - Create project
   - Copy project ID

2. **Install Additional Dependencies**
   ```bash
   npm install @polymarket/clob-client ethers@6
   ```

3. **Start Implementation**
   - Begin with Step 2 (Configure Web3)
   - Follow step-by-step guide above

---

**Want me to implement this now?** I can start coding the wallet integration immediately! 🚀

