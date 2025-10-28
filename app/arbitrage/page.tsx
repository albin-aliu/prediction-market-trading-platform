export default function Arbitrage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Arbitrage Opportunities</h1>
      
      <div className="mb-6 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <p className="text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Arbitrage detection will scan for price discrepancies 
          across different platforms for the same or similar events.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Active Opportunities</h2>
        <p className="text-gray-500">
          No arbitrage opportunities detected. Connect your API key to start monitoring.
        </p>
      </div>
    </div>
  )
}

