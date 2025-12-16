# 🔐 Critical Authentication Parameters for Polymarket Orders

## Parameters That MUST Match

For authentication to work when posting orders, these parameters must be correctly aligned:

### 1. **Wallet Address Alignment**
```
TRADING_PRIVATE_KEY → Wallet Address: 0x9D3bcE1316a56f685A05052FcF69bef4c097C394
POLYMARKET_FUNDER → Funder Address: 0x91c462f1e3ded4a3CF1Ec8199791088ab732f82f
```

**Issue:** These don't match! The API key was generated for the funder address, but we're using a different wallet.

### 2. **API Key Requirements**
- **API Key** must be generated for the **funder address** (or the wallet address if no proxy)
- **API Secret** must match the API key
- **API Passphrase** must match the API key
- API key must have **write/trading permissions** (not just read)

### 3. **Signature Type**
- **0 (EOA)**: If trading directly from wallet (no proxy)
- **2 (GNOSIS_SAFE)**: If using Polymarket proxy wallet (POLYMARKET_FUNDER set)

### 4. **ClobClient Initialization Parameters**
```typescript
new ClobClient(
  host: 'https://clob.polymarket.com',
  chainId: 137,
  wallet: Wallet,              // Wallet from TRADING_PRIVATE_KEY
  apiCreds: {                  // API credentials
    key: API_KEY,
    secret: API_SECRET,
    passphrase: API_PASSPHRASE
  },
  signatureType: 0 or 2,       // Must match wallet type
  funderAddress: string,       // Must match API key's wallet
  undefined,                    // geoBlockToken
  true                         // useServerTime
)
```

## Current Mismatch

**Problem:** 
- Wallet from `TRADING_PRIVATE_KEY`: `0x9D3bcE1316a56f685A05052FcF69bef4c097C394`
- Funder address (`POLYMARKET_FUNDER`): `0x91c462f1e3ded4a3CF1Ec8199791088ab732f82f`
- API key was generated for: `0x91c462f1e3ded4a3CF1Ec8199791088ab732f82f`

**Solution Options:**

### Option 1: Use the funder's private key
- Set `TRADING_PRIVATE_KEY` to the private key of `0x91c462f1e3ded4a3CF1Ec8199791088ab732f82f`
- This way the wallet and funder match

### Option 2: Generate API key for the trading wallet
- Generate a new API key for wallet `0x9D3bcE1316a56f685A05052FcF69bef4c097C394`
- Don't use `POLYMARKET_FUNDER` (set it to empty)
- Use signature type 0 (EOA)

### Option 3: Use derive API key (recommended)
- Don't use pre-configured API credentials
- Let the SDK derive the API key from the wallet
- This ensures the API key matches the wallet automatically

## Verification Checklist

- [ ] Wallet address from `TRADING_PRIVATE_KEY` matches the wallet the API key was generated for
- [ ] `POLYMARKET_FUNDER` (if set) matches the API key's wallet
- [ ] `signatureType` matches the wallet type (0 for EOA, 2 for proxy)
- [ ] API key has write/trading permissions (not just read)
- [ ] API credentials (key, secret, passphrase) are all correct and match each other

