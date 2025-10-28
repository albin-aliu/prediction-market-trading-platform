# PolyRouter API Setup Guide

## Quick Start: Getting Your Markets Live

Follow these steps to connect to real prediction markets from Polymarket and Kalshi.

## 🔑 Step 1: Get Your PolyRouter API Key

### Option A: Sign Up (If New)
1. Visit **https://www.polyrouter.io/**
2. Click "Sign Up" or "Get Started"
3. Complete the registration
4. Navigate to your Dashboard/API Settings
5. Click "Generate API Key" or "Create New Key"
6. **Copy your API key** (starts with something like `pk_live_...` or similar)

### Option B: Existing User
1. Visit **https://www.polyrouter.io/**
2. Log in to your account
3. Go to Settings → API Keys
4. Generate a new key or copy an existing one

> ⚠️ **Important**: Keep your API key secret! Never commit it to GitHub or share it publicly.

---

## 📝 Step 2: Add API Key to Your Project

### Edit the .env file

```bash
# Open the .env file
nano ~/projects/prediction-market-trading-platform/.env

# Or use any text editor:
code ~/projects/prediction-market-trading-platform/.env
```

### Update this line:

**Change from:**
```bash
POLYROUTER_API_KEY=your_api_key_here
```

**To:**
```bash
POLYROUTER_API_KEY=pk_live_your_actual_key_here
```

Save the file (in nano: `Ctrl+X`, then `Y`, then `Enter`)

---

## 🔄 Step 3: Restart Your Development Server

### Stop the current server:
- Press `Ctrl+C` in the terminal where `npm run dev` is running

### Start it again:
```bash
cd ~/projects/prediction-market-trading-platform
npm run dev
```

---

## ✅ Step 4: Test It Out!

1. Open your browser to **http://localhost:3000**
2. Scroll down to the **"All Markets"** section
3. You should now see real markets from Polymarket and Kalshi!
4. Click the **Buy YES** or **Buy NO** buttons to test (currently shows alert, full trading coming soon)

---

## 🎯 What You Can Do Now

### View Markets
- See real-time markets from multiple platforms
- Filter by platform (Polymarket, Kalshi, Manifold, Limitless)
- Filter by status (Open, Closed, Resolved)
- Refresh to get latest data

### Market Information
Each market shows:
- **Title**: The prediction market question
- **Platform**: Where the market is hosted
- **YES Price**: Current price for YES outcome (in cents)
- **Volume 24h**: Trading volume in last 24 hours
- **Status**: Open, Closed, or Resolved

### Trading Buttons
- **Buy YES**: Place a bet that the outcome will be YES
- **Buy NO**: Place a bet that the outcome will be NO

---

## 🔧 Troubleshooting

### "Error: PolyRouter API key not configured"
- Make sure you added the API key to `.env`
- Check that the key doesn't have `your_api_key_here` as the value
- Restart the dev server after adding the key

### "Error: Failed to fetch markets"
- Check your internet connection
- Verify your API key is valid (try logging into PolyRouter)
- Check if PolyRouter API is operational: https://www.polyrouter.io/status

### "No markets found"
- Try changing the filters (select "All Platforms" and "Open")
- Click the "Refresh" button
- Check the browser console for errors (F12 → Console tab)

### Server not updating after .env change
- Make sure you **fully restarted** the server (Ctrl+C, then `npm run dev`)
- Don't just save the file - you must restart!

---

## 📚 Next Steps

Once you have markets displaying:

1. **Implement Order Placement**
   - Connect to platform-specific APIs
   - Add wallet integration
   - Implement actual trade execution

2. **Add Arbitrage Detection**
   - Compare prices across platforms
   - Identify profitable opportunities
   - Alert on good spreads

3. **Enhance UI**
   - Add market search functionality
   - Show price charts
   - Display position tracking

---

## 🔗 Resources

- **PolyRouter Docs**: https://www.polyrouter.io/docs
- **API Reference**: https://www.polyrouter.io/api
- **Polymarket**: https://polymarket.com/
- **Kalshi**: https://kalshi.com/

---

## 💡 Pro Tips

1. **Free Tier**: Check if PolyRouter has a free tier for testing
2. **Rate Limits**: Be aware of API rate limits when refreshing frequently
3. **Test Mode**: Some platforms offer test/sandbox modes - use these first!
4. **Start Small**: When implementing real trading, start with small amounts

---

**Ready to trade? Get your API key and let's go!** 🚀

