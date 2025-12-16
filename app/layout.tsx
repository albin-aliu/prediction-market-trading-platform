import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/components/Web3Provider'
import { WalletConnect } from '@/components/WalletConnect'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PredictTrade - Prediction Market Trading',
  description: 'Trade on Polymarket and Kalshi prediction markets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <Web3Provider>
          {/* Clean Navigation */}
          <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    PredictTrade
                  </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-1">
                  <Link 
                    href="/"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Markets
                  </Link>
                  <Link 
                    href="/portfolio"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Portfolio
                  </Link>
                  <Link 
                    href="/arbitrage"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Arbitrage
                  </Link>
                </div>

                {/* Wallet */}
                <div className="flex items-center">
                  <WalletConnect />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="pt-16 min-h-screen">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                © 2025 PredictTrade • Trade responsibly
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Powered by Polymarket • Built with Next.js
              </p>
            </div>
          </footer>
        </Web3Provider>
      </body>
    </html>
  )
}
