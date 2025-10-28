# Prediction Market Trading Platform

A platform for arbitraging prediction markets across multiple platforms (Polymarket, Kalshi, Manifold, etc.) using the [PolyRouter API](https://www.polyrouter.io/).

## Features

- 🔄 Unified API integration with multiple prediction market platforms
- 💹 Real-time market data and price monitoring
- 🤖 Automated arbitrage detection
- 🎯 Manual trading via frontend interface
- 📊 Trading dashboard with market analytics
- 🔌 RESTful API for programmatic trading

## Tech Stack

- **Frontend**: Next.js 14 (React) with App Router
- **Backend**: Next.js API Routes
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: PolyRouter API

## Project Structure

```
prediction-market-trading-platform/
├── app/                    # Next.js app directory
│   ├── api/               # API routes for trading
│   ├── dashboard/         # Trading dashboard pages
│   ├── markets/           # Market listing and details
│   └── page.tsx           # Home page
├── components/            # Reusable React components
├── lib/                   # Utility functions and API clients
│   ├── polyrouter.ts     # PolyRouter API client
│   ├── arbitrage.ts      # Arbitrage detection logic
│   └── types.ts          # TypeScript types
├── public/               # Static assets
└── config/              # Configuration files
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PolyRouter API key (get one at [polyrouter.io](https://www.polyrouter.io/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/prediction-market-trading-platform.git
   cd prediction-market-trading-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   POLYROUTER_API_KEY=your_actual_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Frontend Trading Interface

1. Navigate to `/dashboard` to view all available markets
2. Click on a market to see details and place trades
3. Monitor your positions and arbitrage opportunities

### API Endpoints

#### Get Markets
```bash
GET /api/markets?platform=kalshi&status=open
```

#### Place Order
```bash
POST /api/orders
Content-Type: application/json

{
  "platform": "polymarket",
  "marketId": "...",
  "side": "buy",
  "amount": 100
}
```

#### Find Arbitrage Opportunities
```bash
GET /api/arbitrage
```

## Development Roadmap

### Phase 1: Foundation (Current)
- [x] Project setup
- [ ] PolyRouter API integration
- [ ] Basic market listing UI
- [ ] Manual order placement

### Phase 2: Arbitrage Detection
- [ ] Cross-platform price comparison
- [ ] Arbitrage opportunity detection algorithm
- [ ] Alert system for profitable trades
- [ ] Trade execution API

### Phase 3: Automation
- [ ] Automated arbitrage bot
- [ ] Risk management system
- [ ] Position tracking and P&L
- [ ] WebSocket integration for real-time updates

### Phase 4: Advanced Features
- [ ] Historical data analysis
- [ ] Machine learning for price prediction
- [ ] Portfolio optimization
- [ ] Mobile app

## API Documentation

### PolyRouter Integration

This platform uses [PolyRouter](https://www.polyrouter.io/) as the unified API to access multiple prediction market platforms.

#### Supported Platforms
- Polymarket
- Kalshi
- Manifold
- Limitless
- SX Bet
- Novig
- ProphetX

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for your own projects.

## Disclaimer

⚠️ **Important**: This software is for educational purposes only. Trading prediction markets involves financial risk. Always do your own research and never risk more than you can afford to lose. The authors are not responsible for any financial losses incurred through the use of this software.

## Resources

- [PolyRouter Documentation](https://www.polyrouter.io/)
- [Polymarket](https://polymarket.com/)
- [Kalshi](https://kalshi.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

For issues and questions, please open an issue on GitHub.

