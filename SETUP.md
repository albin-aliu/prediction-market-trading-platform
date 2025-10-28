# Setup Guide for Prediction Market Trading Platform

## Prerequisites Installation

Your system needs Node.js and Git to run this project. Follow these steps:

### 1. Install Xcode Command Line Tools (Required for Git)

Open Terminal and run:
```bash
xcode-select --install
```

A dialog will appear - click "Install" and wait for it to complete (5-10 minutes).

### 2. Install Homebrew (Package Manager for macOS)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installation, follow the on-screen instructions to add Homebrew to your PATH.

### 3. Install Node.js (Required to run the application)

```bash
brew install node
```

Verify installation:
```bash
node --version
npm --version
```

## Project Setup

### 4. Navigate to Project Directory

```bash
cd ~/projects/prediction-market-trading-platform
```

### 5. Install Project Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, TypeScript, and Tailwind CSS.

### 6. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file and add your PolyRouter API key:
```bash
nano .env
```

Update:
```
POLYROUTER_API_KEY=your_actual_api_key_here
```

Save (Ctrl+X, then Y, then Enter)

### 7. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Prediction market trading platform setup"
```

### 8. Create GitHub Repository and Push

1. **Go to GitHub**: Visit https://github.com/new

2. **Create Repository**:
   - Repository name: `prediction-market-trading-platform`
   - Description: "Arbitrage trading platform for prediction markets"
   - Visibility: **Public**
   - Do NOT initialize with README, .gitignore, or license (we already have these)

3. **Push to GitHub**:

After creating the repo on GitHub, run these commands (replace YOUR_USERNAME):

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/prediction-market-trading-platform.git
git push -u origin main
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Open your browser to: http://localhost:3000

### Build for Production

```bash
npm run build
npm start
```

## Getting Your PolyRouter API Key

1. Visit https://www.polyrouter.io/
2. Sign up or log in
3. Navigate to your dashboard/API settings
4. Generate a new API key
5. Copy the key and add it to your `.env` file

## Project Structure

```
prediction-market-trading-platform/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── markets/       # Get markets data
│   │   ├── orders/        # Place and track orders
│   │   └── arbitrage/     # Arbitrage detection
│   ├── dashboard/         # Trading dashboard
│   ├── markets/           # Market listings
│   ├── arbitrage/         # Arbitrage opportunities
│   └── page.tsx           # Home page
├── lib/                   # Utility functions
│   ├── polyrouter.ts     # PolyRouter API client
│   ├── arbitrage.ts      # Arbitrage detection
│   └── types.ts          # TypeScript types
├── components/           # React components (to be added)
├── public/              # Static files
├── .env                 # Environment variables (not committed)
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

## Next Steps

1. **Test the Setup**: Run `npm run dev` and visit http://localhost:3000
2. **Add PolyRouter Integration**: Update `lib/polyrouter.ts` with actual API calls
3. **Implement Trading Logic**: Build out the order placement system
4. **Add Arbitrage Detection**: Implement the arbitrage algorithm
5. **Build UI Components**: Create reusable components for markets and orders

## Troubleshooting

### "command not found: npm"
- Make sure you completed step 3 (Install Node.js)
- Restart your terminal after installation

### "POLYROUTER_API_KEY not set"
- Make sure you created the `.env` file from `.env.example`
- Add your actual API key to the file

### Port 3000 already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
# Then run npm run dev again
```

## Resources

- [PolyRouter Documentation](https://www.polyrouter.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Support

For issues or questions, please open an issue on the GitHub repository.

