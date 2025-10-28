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

          <div className="mt-12">
            <a 
              href="#dashboard" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 inline-block transition-colors"
            >
              Get Started →
            </a>
          </div>
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
          
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">All Platforms</option>
              <option value="polymarket">Polymarket</option>
              <option value="kalshi">Kalshi</option>
              <option value="manifold">Manifold</option>
              <option value="limitless">Limitless</option>
            </select>
            
            <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="resolved">Resolved</option>
            </select>
            
            <input 
              type="text" 
              placeholder="Search markets..." 
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-6 py-3 flex-1 max-w-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-2xl font-semibold mb-4">Available Markets</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Connect your PolyRouter API key to view available markets
            </p>
          </div>
        </div>
      </section>

      {/* Arbitrage Section */}
      <section id="arbitrage" className="min-h-screen bg-white dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold mb-12 text-center">Arbitrage Opportunities</h2>
          
          <div className="mb-8 bg-blue-50 dark:bg-blue-900 p-6 rounded-xl border-l-4 border-blue-500">
            <p className="text-blue-800 dark:text-blue-200 text-lg">
              <strong>Note:</strong> Arbitrage detection will scan for price discrepancies 
              across different platforms for the same or similar events.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-semibold mb-4">Active Opportunities</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No arbitrage opportunities detected. Connect your API key to start monitoring.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

