import { MarketsList } from '@/components/MarketsList'
import { ArbitrageOpportunities } from '@/components/ArbitrageOpportunities'
import { OrderForm } from '@/components/OrderForm'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-6xl font-bold mb-6">
            Prediction Market Trading Platform
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Arbitrage opportunities across Polymarket, Kalshi, and more
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
            <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-xl hover:shadow-2xl transition-shadow">
              <h2 className="text-3xl font-semibold mb-4">📊 Multi-Platform</h2>
              <p className="text-gray-300">
                Access Polymarket, Kalshi, Manifold, and more through one unified interface
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

      {/* Arbitrage Opportunities Section */}
      <section id="arbitrage-top" className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">🎯 Market Comparison Dashboard</h2>
            <p className="text-xl text-gray-300 mb-2">
              Side-by-side comparison: Polymarket vs Kalshi
            </p>
            <p className="text-sm text-gray-400">
              Demonstrating real-time market data across platforms
            </p>
          </div>
          <ArbitrageOpportunities />
        </div>
      </section>

      {/* Order Placement Section */}
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
          <OrderForm />
        </div>
      </section>

      {/* Dashboard Section */}
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
            <h3 className="text-2xl font-semibold mb-4">Active Markets</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Connect your PolyRouter API key to view markets
            </p>
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section id="markets" className="min-h-screen bg-gray-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold mb-12 text-center">All Markets</h2>
          
          <MarketsList />
        </div>
      </section>

      {/* Arbitrage Section */}
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
