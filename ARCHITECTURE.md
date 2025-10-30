# 🏗️ Platform Architecture Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [File Structure](#file-structure)
3. [Data Flow](#data-flow)
4. [Key Components](#key-components)
5. [API Integration](#api-integration)

---

## 🎯 System Overview

This is a **Next.js 14 App Router** application that:
- Fetches live prediction market data from **Polymarket**
- Displays markets with images, prices, and volume
- Detects arbitrage opportunities (price differences)
- Provides a demo trading interface

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Direct REST calls to Polymarket
- **State**: React hooks (useState, useEffect)

---

## 📁 File Structure

```
prediction-market-trading-platform/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (navigation, footer)
│   ├── page.tsx                 # ⭐ MAIN HOMEPAGE (entry point)
│   ├── api/                     # Server-side API routes
│   │   ├── markets/route.ts     # GET /api/markets - Fetch markets
│   │   └── arbitrage/route.ts   # GET /api/arbitrage - Find opportunities
│
├── components/                   # React UI components
│   ├── MarketsList.tsx          # Displays grid of market cards
│   ├── MarketCard.tsx           # Single market display
│   ├── ArbitrageOpportunities.tsx  # Fetches & displays arbitrage
│   ├── ArbitrageCard.tsx        # Single arbitrage opportunity
│   └── OrderForm.tsx            # Trading form (demo mode)
│
├── lib/                          # Business logic & API clients
│   ├── polymarket-api.ts        # ⭐ Direct Polymarket API client
│   ├── markets-client.ts        # Unified market data aggregator
│   ├── types.ts                 # TypeScript interfaces
│   └── kalshi-api.ts            # Kalshi stub (not used)
│
└── .env                          # Environment variables (API keys)
```

---

## 🔄 Data Flow

### 1. User Opens Homepage (`http://localhost:3002`)

```
Browser Request
    ↓
app/page.tsx (Main Page)
    ↓
Renders 6 sections:
    1. Hero Section
    2. Arbitrage Dashboard → <ArbitrageOpportunities />
    3. Order Form → <OrderForm />
    4. Trading Dashboard (stats)
    5. Markets List → <MarketsList />
    6. Arbitrage Info
```

### 2. Markets List Component Loads

```
<MarketsList /> mounts
    ↓
useEffect() triggers
    ↓
fetch('/api/markets?status=open&limit=20')
    ↓
app/api/markets/route.ts
    ↓
marketsClient.getMarkets()
    ↓
lib/polymarket-api.ts → getSimplifiedMarkets()
    ↓
Fetches from: https://gamma-api.polymarket.com/markets
    ↓
Returns JSON with market data
    ↓
Component displays <MarketCard /> for each market
```

### 3. Arbitrage Detection Flow

```
<ArbitrageOpportunities /> mounts
    ↓
fetch('/api/arbitrage?limit=5')
    ↓
app/api/arbitrage/route.ts
    ↓
1. Fetch Polymarket markets
2. Calculate price spreads between YES/NO
3. Sort by profit potential
4. Return top opportunities
    ↓
Component displays <ArbitrageCard /> for each
```

---

## 🔑 Key Components

### **1. Main Homepage** (`app/page.tsx`)
**Purpose**: Entry point that orchestrates all sections

**Sections**:
- Hero (static content)
- Arbitrage Dashboard (live data)
- Order Form (demo trading)
- Markets List (live Polymarket data)

**How to control what's displayed**:
```typescript
// In app/page.tsx, each section can be customized:

// Show 5 arbitrage opportunities
<ArbitrageOpportunities />  // Defaults to limit=5

// Show 20 markets
<MarketsList />  // Fetches with limit=20 (see component)
```

### **2. Polymarket API Client** (`lib/polymarket-api.ts`)
**Purpose**: Handles all communication with Polymarket

**Key Methods**:
- `getMarkets(limit)` - Fetches raw market data
- `getSimplifiedMarkets(limit)` - Returns cleaned, standardized format
- `getMarket(id)` - Fetches single market by ID

**How it works**:
```typescript
// Fetches from Polymarket's public API
const response = await fetch(
  `https://gamma-api.polymarket.com/markets?limit=${limit}&active=true&closed=false`
)

// Parses JSON strings from API (outcomes, prices)
const outcomes = JSON.parse(m.outcomes || '[]')
const prices = JSON.parse(m.outcomePrices || '[]')

// Finds YES/NO prices from arrays
const yesPrice = prices[outcomes.indexOf('Yes')]
```

### **3. Markets Client** (`lib/markets-client.ts`)
**Purpose**: Unified interface for all market platforms

**Why it exists**: 
- Abstracts platform differences
- Easy to add new platforms later
- Single API for components

**Current platforms**: Polymarket only (Kalshi removed)

### **4. API Routes** (`app/api/*/route.ts`)
**Purpose**: Server-side endpoints that run on Next.js server

**Why server-side?**:
- Hide API keys
- Rate limiting control
- Data transformation
- CORS handling

**Endpoints**:
- `GET /api/markets` - Fetch markets with filters
- `GET /api/arbitrage` - Calculate arbitrage opportunities

---

## 🔌 API Integration

### Polymarket API

**Base URL**: `https://gamma-api.polymarket.com`

**Endpoints Used**:
```
GET /markets?limit=100&active=true&closed=false
```

**Response Structure**:
```json
{
  "conditionId": "0x1234...",
  "question": "Will Bitcoin reach $100k in 2025?",
  "outcomes": "[\"Yes\",\"No\"]",  // JSON string!
  "outcomePrices": "[\"0.65\",\"0.35\"]",  // JSON string!
  "volumeNum": 1234567,
  "liquidityNum": 500000,
  "image": "https://polymarket-upload.s3...",
  "active": true,
  "closed": false
}
```

**Key Details**:
- `outcomes` and `outcomePrices` are **JSON strings** (must parse!)
- Prices are decimals (0.65 = 65¢)
- Public API (no key needed)
- Rate limited (be careful!)

---

## 🎚️ How to Control Display

### Number of Markets Shown

**Option 1**: Change in component (`components/MarketsList.tsx`)
```typescript
// Line ~18
const response = await fetch('/api/markets?status=open&limit=50')
//                                                         ↑ Change this
```

**Option 2**: Change in API route (`app/api/markets/route.ts`)
```typescript
// Line ~8
const limit = parseInt(searchParams.get('limit') || '20')
//                                                    ↑ Default limit
```

### Number of Arbitrage Opportunities

**In component** (`components/ArbitrageOpportunities.tsx`):
```typescript
// Line ~36
const response = await fetch('/api/arbitrage?limit=10')
//                                             ↑ Change this
```

### Filter by Platform

```typescript
// Show only Polymarket markets
fetch('/api/markets?platform=polymarket&limit=20')

// Show all platforms (when we add more)
fetch('/api/markets?platform=all&limit=20')
```

---

## 🐛 Known Issues & Fixes

### Issue 1: Kalshi Integration Not Working
**Status**: Removed (no API keys)
**Files affected**: 
- `lib/kalshi-api.ts` (stub only)
- Not used in production

### Issue 2: Arbitrage Detection Returns 0 Opportunities
**Cause**: Only have Polymarket data (need 2+ platforms to compare)
**Fix**: Currently showing Polymarket markets as standalone

### Issue 3: Some Markets Show 0¢ Prices
**Cause**: Closed/inactive markets slip through filters
**Fix**: Enhanced filtering in API client

---

## 🚀 Adding a New Market Platform

To add a new platform (e.g., Manifold, PredictIt):

1. Create API client: `lib/newplatform-api.ts`
2. Implement `getSimplifiedMarkets()` method
3. Add to `lib/markets-client.ts`:
   ```typescript
   private newPlatform = new NewPlatformAPI()
   
   // In getMarkets():
   const newMarkets = await this.newPlatform.getSimplifiedMarkets(limit)
   ```
4. Update arbitrage logic to compare platforms

---

## 📝 Next Steps

1. ✅ Polymarket integration (DONE)
2. ⏳ Add real wallet connection
3. ⏳ Add more platforms for arbitrage
4. ⏳ Historical price charts
5. ⏳ Real order execution

---

**Last Updated**: October 30, 2025
**Version**: 2.0 (Direct API)

