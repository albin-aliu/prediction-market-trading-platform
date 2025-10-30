# 🎯 Quick Reference: Trading Components

## ❓ Your Question:
> "I want to execute a trade from the server. What components do I need? What APIs do I call? How is the financial exchange facilitated?"

## ✅ The Answer:

### **Critical Concept:**
**You CANNOT execute trades from the server.** Trades must be signed by the user's wallet in their browser for security reasons.

---

## 📋 What You Need to Build

### **1. Client-Side Components (Browser)**

```
WalletConnect.tsx
└─► Connects user's MetaMask wallet
    └─► Displays wallet address & balance

TradingForm.tsx  
└─► User selects market, amount, price
    └─► Calls approveUSDC() first
        └─► Then calls placeOrder()
            └─► User signs in MetaMask
                └─► Transaction sent to blockchain
```

### **2. Server-Side APIs (Data Only)**

```
/api/markets
└─► GET market data from PolyRouter
    └─► Returns: prices, volumes, descriptions

/api/orderbook
└─► GET order book from Polymarket CLOB
    └─► Returns: current buy/sell orders

/api/portfolio  
└─► GET user's positions from blockchain
    └─► Returns: tokens owned, current value
```

### **3. Trading Libraries**

```
lib/web3-config.ts
└─► Configure wagmi (Polygon chain, connectors)

lib/polymarket-clob-client.ts
└─► Helper functions to call Polymarket CLOB API

lib/contracts.ts
└─► Smart contract addresses (USDC, Exchange)
```

---

## 🔄 How a Trade Actually Works

```
USER ACTION                  SYSTEM RESPONSE

1. Click "Connect Wallet"
                      →      MetaMask popup
                      ←      Wallet connected (0x742d...)

2. Select market & amount
                      →      Fetch market data from server
                      ←      Display current price ($0.65)

3. Click "Approve USDC"
                      →      MetaMask: Sign approval transaction
                      ←      Wait for blockchain (~2s)
                      ←      ✅ USDC approved!

4. Click "Place Order"
                      →      Send order to Polymarket CLOB API
                      ←      CLOB matches with sellers (~100ms)
                      ←      Settlement on blockchain
                      ←      ✅ You own 10 YES shares!

5. View position
                      →      Query blockchain for tokens
                      ←      Display: 10 YES @ $0.65 = $6.50
```

---

## 📡 APIs You'll Call

### **From Your Server (Read-Only Data)**

| API | Endpoint | Purpose |
|-----|----------|---------|
| PolyRouter | `https://api.polyrouter.io/functions/v1/markets-v2` | Get market prices |
| PolyRouter | `/price-history-v2` | Get price charts |
| CLOB | `https://clob.polymarket.com/book` | Get order book |
| Polygon RPC | `https://polygon-rpc.com` | Query blockchain state |

### **From Client Browser (Write Operations)**

| Action | Method | Who Signs |
|--------|--------|-----------|
| Approve USDC | `USDC.approve(exchange, amount)` | User in MetaMask |
| Place Order | `POST clob.polymarket.com/order` | User signs message |
| Cancel Order | `DELETE clob.polymarket.com/order/{id}` | User signs message |

---

## 💰 Financial Exchange Process

### **How Money Flows:**

```
1. User's USDC Balance:  100 USDC

2. User buys 10 YES @ $0.65 each

3. Smart Contract:
   └─► Deducts: 6.5 USDC from user
   └─► Sends: 6.5 USDC to seller
   └─► Gives user: 10 YES tokens
   └─► Gives seller: 10 NO tokens

4. User's New Balance:
   └─► 93.5 USDC
   └─► 10 YES tokens (worth $6.50)

5. When event resolves:
   └─► If YES wins: User gets 10 USDC (profit: $3.50)
   └─► If NO wins: User loses $6.50
```

### **Token Math:**
- Each YES + NO pair always = $1.00
- If YES = $0.65, then NO = $0.35
- To buy YES, you pay the YES price
- Winner gets $1.00 per share

---

## 🛠️ Implementation Checklist

### **Phase 1: Enable Trading**
- [ ] Restore `Web3Provider.tsx` (wagmi setup)
- [ ] Restore `WalletConnect.tsx` (connect button)
- [ ] Update `OrderForm.tsx` to use real wallet
- [ ] Add USDC approval button & flow
- [ ] Integrate Polymarket CLOB API
- [ ] Add transaction status messages

### **Phase 2: Improve UX**
- [ ] Show transaction confirmations
- [ ] Display gas fee estimates
- [ ] Add loading spinners
- [ ] Show error messages clearly
- [ ] Add transaction history

### **Phase 3: Advanced Features**
- [ ] Real-time order book
- [ ] Portfolio tracking
- [ ] Price charts
- [ ] Trade notifications
- [ ] Profit/loss calculator

---

## 📦 Dependencies You Need

```bash
npm install wagmi viem @tanstack/react-query
```

Already installed: ✅

---

## 🔑 Environment Variables

```bash
# .env.local
POLYROUTER_API_KEY=pk_e9b83eeafe...  # ✅ Already set

# Optional but recommended:
NEXT_PUBLIC_ALCHEMY_ID=your_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id_here
```

---

## 🚀 Quick Start Command

To re-enable trading (I can do this for you):

1. Uncomment Web3 imports in `app/layout.tsx`
2. Uncomment wallet hooks in `components/OrderForm.tsx`  
3. Add USDC approval flow
4. Restart server

**Would you like me to implement this now?**

---

## 📚 Files to Read

1. **TRADING_ARCHITECTURE.md** - Deep dive into how everything works
2. **IMPLEMENTATION_GUIDE.md** - Step-by-step code examples
3. **QUICK_REFERENCE.md** - This file (cheat sheet)

---

## 🆘 Common Questions

**Q: Can I automate trading without user approval?**  
A: No. Every trade requires the user to sign in their wallet for security.

**Q: Where do I store my API keys?**  
A: In `.env` file (server-side) or `.env.local` (both). Never in code.

**Q: How long does a trade take?**  
A: ~2 seconds for USDC approval + ~100ms for order execution

**Q: What if user doesn't have USDC?**  
A: They need to buy USDC first (via Uniswap, Coinbase, etc.) and bridge to Polygon.

**Q: Can I test without real money?**  
A: Yes! Use Polygon Mumbai testnet and get free test USDC from faucets.

---

## 🎯 Next Steps

Tell me which you want:

1. **"Re-enable real trading"** - I'll restore Web3 and implement wallet connection
2. **"Show me order book API"** - I'll create the orderbook endpoint
3. **"Create portfolio tracker"** - I'll build a page showing user's positions
4. **"Just explain more"** - Ask me anything specific

Your server is live at: `http://localhost:3000` ✅

