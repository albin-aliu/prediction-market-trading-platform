# 🎯 Execute One Trade - Step by Step

## Quick Start

### Step 1: Get a Token ID

Let's pick a market. Here's an example:

**Market:** "Fed rate hike in 2025?"
- **YES Token ID:** `60487116984468020978247225474488676749601001829886755968952521846780452448915`
- **YES Price:** $0.0055 (very cheap!)
- **NO Price:** $0.9945

### Step 2: Get Your Private Key

You need the private key of the wallet you want to trade with.

**⚠️ SECURITY:** Never share your private key!

### Step 3: Execute the Trade

Run this command (replace `YOUR_PRIVATE_KEY` with your actual private key):

```bash
TRADING_PRIVATE_KEY=YOUR_PRIVATE_KEY \
node scripts/programmatic-trade.js \
  60487116984468020978247225474488676749601001829886755968952521846780452448915 \
  BUY \
  1 \
  0.0055
```

**What this does:**
- Buys 1 share of "Fed rate hike in 2025? YES"
- At price $0.0055 per share
- Total cost: ~$0.0055 USDC

### Step 4: Check the Result

The script will show:
- ✅ Order prepared
- ✅ Order signed
- ✅ Order submitted
- Result from Polymarket

---

## Alternative: Use a Different Market

To find other markets and their token IDs:

```bash
curl -s http://localhost:3000/api/markets | jq '.[0] | {title, yesTokenId, noTokenId, yesPrice, noPrice}'
```

---

## Troubleshooting

**Error: "TRADING_PRIVATE_KEY not set"**
- Make sure you're passing it as an environment variable
- Or add it to `.env.local` and install dotenv

**Error: "Order rejected"**
- Check you have USDC in your wallet
- Check you've approved USDC spending
- Check API keys are correct

**Error: "Server not responding"**
- Make sure `npm run dev` is running
- Check `http://localhost:3000/api/trade/debug` works

