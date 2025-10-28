export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-6">
          Prediction Market Trading Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Arbitrage opportunities across Polymarket, Kalshi, and more
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 border rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">📊 Multi-Platform</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Access Polymarket, Kalshi, Manifold, and more through one unified interface
            </p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">🤖 Automated Trading</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Execute trades programmatically through API or automated bots
            </p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">💹 Arbitrage Detection</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Find and capitalize on price discrepancies across platforms
            </p>
          </div>
        </div>

        <div className="mt-12">
          <a 
            href="/dashboard" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 inline-block"
          >
            Get Started →
          </a>
        </div>
      </div>
    </div>
  )
}

