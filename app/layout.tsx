import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prediction Market Trading Platform',
  description: 'Arbitrage prediction markets across Polymarket, Kalshi, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <nav className="bg-gray-900 text-white p-4 fixed w-full top-0 z-50 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Prediction Market Trader</h1>
            <div className="flex items-center gap-6">
              <div className="space-x-6">
                <a href="#home" className="hover:text-blue-400 transition-colors">Home</a>
                <a href="#trade" className="hover:text-blue-400 transition-colors">Trade</a>
                <a href="#arbitrage-top" className="hover:text-blue-400 transition-colors">Arbitrage</a>
                <a href="#markets" className="hover:text-blue-400 transition-colors">Markets</a>
              </div>
              <div>
                <span className="text-sm text-gray-400">Wallet: Coming Soon</span>
              </div>
            </div>
          </div>
        </nav>
        <main className="pt-16">{children}</main>
        <footer className="bg-gray-900 text-white p-8 text-center">
          <p className="text-lg">© 2025 Prediction Market Trading Platform</p>
          <p className="text-sm text-gray-400 mt-2">Built with Next.js & Direct APIs</p>
        </footer>
      </body>
    </html>
  )
}
