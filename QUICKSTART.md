# Quick Start Guide

## 🚀 Get Up and Running in 10 Minutes

### Step 1: Install Prerequisites (First Time Only)

#### Install Xcode Command Line Tools
```bash
xcode-select --install
```
Click "Install" when the dialog appears. This takes 5-10 minutes.

#### Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Install Node.js
```bash
brew install node
```

Verify:
```bash
node --version  # Should show v18 or higher
```

### Step 2: Install Project Dependencies

```bash
cd ~/projects/prediction-market-trading-platform
npm install
```

### Step 3: Configure API Keys

```bash
cp .env.example .env
nano .env  # Or use your preferred editor
```

Add your PolyRouter API key (get it from https://www.polyrouter.io/):
```
POLYROUTER_API_KEY=your_api_key_here
```

### Step 4: Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser! 🎉

### Step 5: Push to GitHub

1. Go to https://github.com/new
2. Create a repository named: `prediction-market-trading-platform`
3. Make it **Public**
4. Don't add README or .gitignore (we already have them)

Then run:
```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: Prediction market trading platform"

# Connect to GitHub (replace YOUR_USERNAME)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/prediction-market-trading-platform.git
git push -u origin main
```

## 🎯 What You Can Do Now

- **View Markets**: Navigate to `/markets`
- **Trading Dashboard**: Go to `/dashboard`
- **Arbitrage Finder**: Check `/arbitrage`
- **API Endpoints**: Test `/api/markets`, `/api/orders`, `/api/arbitrage`

## 📝 Next Development Steps

1. **Implement PolyRouter Integration**
   - Edit `lib/polyrouter.ts`
   - Add actual API calls to fetch markets

2. **Build Trading Logic**
   - Complete `app/api/orders/route.ts`
   - Add order validation and execution

3. **Create Arbitrage Algorithm**
   - Implement `lib/arbitrage.ts`
   - Add price comparison logic

4. **Enhance UI**
   - Create more components in `components/`
   - Add real-time price updates

## 🐛 Common Issues

**"command not found: npm"**
→ Restart terminal after installing Node.js

**Port 3000 in use**
→ Run: `lsof -ti:3000 | xargs kill -9`

**"No API key"**
→ Make sure `.env` file exists with your key

## 📚 Resources

- [PolyRouter Docs](https://www.polyrouter.io/)
- [Next.js Docs](https://nextjs.org/docs)
- [Project README](./README.md)
- [Full Setup Guide](./SETUP.md)

---

**Need help?** Open an issue on GitHub or check the full SETUP.md guide.

