# 📊 Data Flow Diagram

## 🔄 Complete Request Flow

```
USER OPENS BROWSER
       ↓
http://localhost:3002
       ↓
═══════════════════════════════════════════════════════════════
FRONTEND (Client-Side React Components)
═══════════════════════════════════════════════════════════════
       ↓
app/page.tsx (Main Homepage)
├── Hero Section (static)
├── <ArbitrageOpportunities />  ← Fetches arbitrage data
├── <OrderForm />               ← Demo trading interface
├── Trading Dashboard (static)
├── <MarketsList />            ← Fetches market data  
└── Arbitrage Info (static)
       ↓
═══════════════════════════════════════════════════════════════
API CALLS (Client → Server)
═══════════════════════════════════════════════════════════════

MarketsList Component:
fetch('/api/markets?status=open&limit=20')
       ↓
       
ArbitrageOpportunities Component:
fetch('/api/arbitrage?limit=5')
       ↓
       
═══════════════════════════════════════════════════════════════
API ROUTES (Next.js Server-Side)
═══════════════════════════════════════════════════════════════

app/api/markets/route.ts
  ↓
  calls marketsClient.getMarkets()
  ↓
lib/markets-client.ts
  ↓
  calls polymarket.getSimplifiedMarkets()
  ↓
lib/polymarket-api.ts
  ↓
  ┌─────────────────────────────────────┐
  │ EXTERNAL API CALL                   │
  │ GET https://gamma-api.polymarket.com│
  │     /markets?limit=150              │
  │     &active=true&closed=false       │
  └─────────────────────────────────────┘
  ↓
  Response (JSON):
  [
    {
      conditionId: "0x123...",
      question: "Will Bitcoin reach $100k?",
      outcomes: '["Yes","No"]',           ← JSON string!
      outcomePrices: '["0.65","0.35"]',  ← JSON string!
      volumeNum: 1234567,
      liquidityNum: 500000,
      image: "https://polymarket-upload.s3...",
      active: true,
      closed: false
    },
    ...
  ]
  ↓
  Parse & Transform:
  - JSON.parse(outcomes) → ["Yes", "No"]
  - JSON.parse(outcomePrices) → [0.65, 0.35]
  - Extract yesPrice (0.65) and noPrice (0.35)
  - Add to standard Market interface
  ↓
  Return to API route
  ↓
  API route returns JSON to client
  ↓
═══════════════════════════════════════════════════════════════
DISPLAY (React Components)
═══════════════════════════════════════════════════════════════

MarketsList receives data:
{
  success: true,
  count: 20,
  markets: [
    {
      id: "0x123...",
      platform: "polymarket",
      title: "Will Bitcoin reach $100k?",
      yesPrice: 0.65,  // 65¢
      noPrice: 0.35,   // 35¢
      volume_24h: 1234567,
      image: "https://..."
    },
    ...
  ]
}
  ↓
  Render <MarketCard /> for each market
  ↓
  Display:
  - Market image (header)
  - Title
  - YES price (65¢)
  - NO price (35¢)
  - Volume ($1.23M)
  - Status badge
```

---

## 🎯 Key Files & Their Roles

### **Entry Point**
```
app/page.tsx
  ↓ Renders
  └── All page sections with components
```

### **Data Fetching Components**
```
components/MarketsList.tsx
  ├── useEffect(() => fetch('/api/markets'))
  ├── Loading state
  └── Maps to <MarketCard />

components/ArbitrageOpportunities.tsx
  ├── useEffect(() => fetch('/api/arbitrage'))
  ├── Loading state
  └── Maps to <ArbitrageCard />
```

### **API Routes (Server-Side)**
```
app/api/markets/route.ts
  ├── Receives: ?platform=polymarket&limit=20
  ├── Calls: marketsClient.getMarkets()
  └── Returns: JSON with market data

app/api/arbitrage/route.ts
  ├── Receives: ?limit=5
  ├── Fetches markets from Polymarket
  ├── Calculates price spreads
  └── Returns: JSON with opportunities
```

### **Business Logic**
```
lib/polymarket-api.ts  ⭐ CORE DATA SOURCE
  ├── getMarkets() - Fetches raw data
  ├── getSimplifiedMarkets() - Transforms data
  └── Calls: gamma-api.polymarket.com

lib/markets-client.ts
  ├── Unified interface
  ├── Wraps Polymarket API
  └── Easy to add more platforms

lib/types.ts
  └── TypeScript interfaces for type safety
```

---

## 🔑 How to Control What's Displayed

### **Number of Markets**

**Option 1: Change in Component**
```typescript
// components/MarketsList.tsx (line ~18)
fetch('/api/markets?status=open&limit=50')  // Change 50 to desired number
```

**Option 2: Change Default in API Route**
```typescript
// app/api/markets/route.ts (line ~8)
const limit = parseInt(searchParams.get('limit') || '50')  // Change default
```

**Option 3: Change in Polymarket API Client**
```typescript
// lib/polymarket-api.ts (line ~74)
async getMarkets(limit = 100)  // Change default limit
```

### **Number of Arbitrage Opportunities**

```typescript
// components/ArbitrageOpportunities.tsx (line ~36)
fetch('/api/arbitrage?limit=10')  // Change 10 to desired number
```

---

## 🐛 Debugging Tips

### **Check if API is working:**
```bash
# Test markets endpoint
curl http://localhost:3002/api/markets?platform=polymarket&limit=3

# Test arbitrage endpoint
curl http://localhost:3002/api/arbitrage?limit=5
```

### **Check server logs:**
```bash
tail -f /tmp/server-fixed.log
```

### **Common Issues:**

1. **No markets showing**
   - Check: Is Polymarket API accessible?
   - Test: `curl https://gamma-api.polymarket.com/markets?limit=5`
   - Check: Browser console for fetch errors

2. **Images not loading**
   - Check: Image URL in API response
   - Check: S3 bucket accessibility
   - Check: Browser console for CORS errors

3. **Prices showing 0¢**
   - Check: Is market closed?
   - Check: JSON parsing in `getSimplifiedMarkets()`
   - Check: Array indices for outcomes

---

## 📝 Adding New Features

### **Add a New Platform (e.g., Manifold)**

1. Create API client:
   ```typescript
   // lib/manifold-api.ts
   export class ManifoldAPI {
     async getSimplifiedMarkets(limit: number) {
       // Fetch from Manifold API
       // Transform to standard Market format
       // Return Market[]
     }
   }
   ```

2. Update markets client:
   ```typescript
   // lib/markets-client.ts
   import { ManifoldAPI } from './manifold-api'
   
   export class MarketsClient {
     private manifold = new ManifoldAPI()
     
     async getMarkets(params) {
       if (params.platform === 'manifold') {
         return await this.manifold.getSimplifiedMarkets(limit)
       }
       // ... existing code
     }
   }
   ```

3. Test:
   ```bash
   curl http://localhost:3002/api/markets?platform=manifold&limit=10
   ```

---

**Last Updated**: October 30, 2025

