import { Market } from '@/lib/types'

interface MarketCardProps {
  market: Market
  onClick?: () => void
}

export function MarketCard({ market, onClick }: MarketCardProps) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold flex-1">{market.title}</h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
          {market.platform}
        </span>
      </div>
      
      {market.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {market.description}
        </p>
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold text-green-600">
            {market.yesPrice ? `${(market.yesPrice * 100).toFixed(1)}%` : 'N/A'}
          </span>
          <span className="text-sm text-gray-500 ml-2">YES</span>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">Volume 24h</div>
          <div className="font-semibold">
            ${market.volume_24h?.toLocaleString() ?? '0'}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t flex justify-between text-sm text-gray-500">
        <span className={`font-medium ${
          market.status === 'open' ? 'text-green-600' : 
          market.status === 'closed' ? 'text-gray-600' : 
          'text-blue-600'
        }`}>
          {market.status.toUpperCase()}
        </span>
        {market.expiresAt && (
          <span>Expires: {new Date(market.expiresAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  )
}

