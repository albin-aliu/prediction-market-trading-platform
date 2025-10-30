/**
 * MAIN HOMEPAGE
 * 
 * This is the entry point of the application. It orchestrates all major sections:
 * 1. Hero - Welcome section with feature highlights
 * 2. Arbitrage Dashboard - Live market comparison (calls /api/arbitrage)
 * 3. Order Form - Demo trading interface
 * 4. Trading Dashboard - Portfolio stats (placeholder)
 * 5. Markets List - Live Polymarket data (calls /api/markets)
 * 6. Arbitrage Info - Educational section
 * 
 * Data Flow:
 * - Components fetch data client-side from /api/* endpoints
 * - API routes run on server and call Polymarket API
 * - Real-time updates when components mount
 */

import { MarketsList } from '@/components/MarketsList'
import { ArbitrageOpportunities } from '@/components/ArbitrageOpportunities'
import { OrderForm } from '@/components/OrderForm'

export default function Home() {
  return (
    <div>
      {/* ===== SECTION 1: HERO ===== */}
      {/* Static landing section with platform overview */}
      <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-6xl font-bold mb-6">
            Prediction Market Trading Platform
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Live prediction market data and arbitrage opportunities
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-xl hover:shadow-2xl transition-shadow">
              <h2 className="text-3xl font-semibold mb-4">📊 Live Market Data</h2>
              <p className="text-gray-300">
                Real-time prediction market data with images, prices, and volume from Polymarket
              </p>
            </div>
            
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-xl hover:shadow-2xl transition-shadow">
              <h2 className="text-3xl font-semibold mb-4">🤖 Automated Trading</h2>
              <p className="text-gray-300">
                Execute trades programmatically through API or automated bots
              </p>
            </div>
            
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-xl hover:shadow-2xl transition-shadow">
              <h2 className="text-3xl font-semibold mb-4">💹 Arbitrage Detection</h2>
              <p className="text-gray-300">
                Find and capitalize on price discrepancies across platforms
              </p>
            </div>
          </div>

          <div className="mt-12 flex gap-4 justify-center">
            <a 
              href="#trade" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 inline-block transition-colors"
            >
              Start Trading →
            </a>
            <a 
              href="#arbitrage-top" 
              className="bg-purple-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-purple-700 inline-block transition-colors"
            >
              View Arbitrage →
            </a>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: ARBITRAGE DASHBOARD ===== */}
      {/* 
        Fetches data from /api/arbitrage and displays opportunities
        This component:
        - Calls ArbitrageOpportunities which fetches from /api/arbitrage?limit=5
        - Shows loading spinner while fetching
        - Displays ArbitrageCard components for each opportunity
        - Currently shows Polymarket markets (need 2+ platforms for real arbitrage)
      */}
      <section id="arbitrage-top" className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">🎯 Market Dashboard</h2>
            <p className="text-xl text-gray-300 mb-2">
              Live Polymarket data with images and prices
            </p>
            <p className="text-sm text-gray-400">
              Real-time updates from Polymarket API
            </p>
          </div>
          {/* Component: Fetches arbitrage data and displays cards */}
          <ArbitrageOpportunities />
        </div>
      </section>

      {/* ===== SECTION 3: ORDER FORM ===== */}
      {/* 
        Demo trading interface (no real money)
        To change number of markets shown, edit OrderForm.tsx line ~30
      */}
      <section id="trade" className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">📈 Place Your Order</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              Trade on prediction markets with ease
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Demo mode - Connect wallet for real trading
            </p>
          </div>
          {/* Component: Order form with market selection, amount, order type */}
          <OrderForm />
        </div>
      </section>

      {/* ===== SECTION 4: TRADING DASHBOARD ===== */}
      {/* Placeholder stats - will be connected to real data later */}
      <section id="dashboard" className="min-h-screen bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold mb-12 text-center">Trading Dashboard</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-sm font-semibold mb-2 opacity-90">Total Portfolio</h3>
              <p className="text-4xl font-bold">$0.00</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-sm font-semibold mb-2 opacity-90">Active Positions</h3>
              <p className="text-4xl font-bold">0</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-sm font-semibold mb-2 opacity-90">P&L Today</h3>
              <p className="text-4xl font-bold">+$0.00</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-sm font-semibold mb-2 opacity-90">Opportunities</h3>
              <p className="text-4xl font-bold">0</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-semibold mb-4">Recent Activity</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Your trading history and market positions will appear here
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: ALL MARKETS LIST ===== */}
      {/* 
        Primary market display - fetches from /api/markets
        Component: MarketsList
        - Fetches /api/markets?status=open&limit=20 (line ~18 in MarketsList.tsx)
        - Shows grid of MarketCard components with images
        - To change limit, edit MarketsList.tsx line ~18
      */}
      <section id="markets" className="min-h-screen bg-gray-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold mb-12 text-center">All Markets</h2>
          
          {/* Component: Fetches and displays market cards in grid */}
          <MarketsList />
        </div>
      </section>

      {/* ===== SECTION 6: ARBITRAGE INFO ===== */}
      {/* Educational section explaining arbitrage */}
      <section id="arbitrage" className="min-h-screen bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold mb-12 text-center">Arbitrage Opportunities</h2>
          
          <div className="mb-8 bg-blue-50 dark:bg-blue-900 p-6 rounded-xl border-l-4 border-blue-500">
            <p className="text-blue-800 dark:text-blue-200 text-lg">
              <strong>Note:</strong> Arbitrage detection scans for price discrepancies 
              across different platforms for the same or similar events.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-semibold mb-4">Active Opportunities</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Scroll up to see live arbitrage opportunities or check the Markets section for individual market data.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
