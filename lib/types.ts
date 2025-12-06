// Type definitions for the trading platform

export interface Market {
  id: string
  platform: Platform
  title: string
  description?: string
  status: MarketStatus
  volume_24h?: number
  liquidity?: number
  yesPrice?: number
  noPrice?: number
  createdAt: Date
  expiresAt?: Date
  image?: string
  icon?: string
  // Polymarket-specific token IDs for trading
  yesTokenId?: string
  noTokenId?: string
}

export type Platform = 
  | 'polymarket'
  | 'kalshi'
  | 'manifold'
  | 'limitless'
  | 'sxbet'
  | 'novig'
  | 'prophetx'
  | 'all'

export type MarketStatus = 'open' | 'closed' | 'resolved'

export interface Order {
  id: string
  marketId: string
  platform: Platform
  side: 'buy' | 'sell'
  outcome: 'yes' | 'no'
  amount: number
  price: number
  status: OrderStatus
  createdAt: Date
  filledAt?: Date
}

export type OrderStatus = 
  | 'pending'
  | 'filled'
  | 'cancelled'
  | 'rejected'

export interface ArbitrageOpportunity {
  id: string
  markets: Market[]
  expectedProfit: number
  profitPercentage: number
  risk: 'low' | 'medium' | 'high'
  strategy: string
  detectedAt: Date
}

export interface Position {
  id: string
  marketId: string
  platform: Platform
  outcome: 'yes' | 'no'
  shares: number
  averagePrice: number
  currentPrice: number
  unrealizedPnL: number
}

export interface PolyRouterConfig {
  apiKey: string
  baseUrl?: string
}

