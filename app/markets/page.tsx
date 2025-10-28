export default function Markets() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">All Markets</h1>
      
      <div className="mb-6 flex gap-4">
        <select className="border rounded px-4 py-2">
          <option value="">All Platforms</option>
          <option value="polymarket">Polymarket</option>
          <option value="kalshi">Kalshi</option>
          <option value="manifold">Manifold</option>
          <option value="limitless">Limitless</option>
        </select>
        
        <select className="border rounded px-4 py-2">
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="resolved">Resolved</option>
        </select>
        
        <input 
          type="text" 
          placeholder="Search markets..." 
          className="border rounded px-4 py-2 flex-1"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <p className="text-gray-500">
          Connect your PolyRouter API key to view available markets
        </p>
      </div>
    </div>
  )
}

