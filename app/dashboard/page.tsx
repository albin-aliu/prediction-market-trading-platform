export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Trading Dashboard</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">Total Portfolio</h3>
          <p className="text-3xl font-bold">$0.00</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">Active Positions</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">P&L Today</h3>
          <p className="text-3xl font-bold text-green-500">+$0.00</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">Opportunities</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Active Markets</h2>
        <p className="text-gray-500">
          Connect your PolyRouter API key to view markets
        </p>
      </div>
    </div>
  )
}

