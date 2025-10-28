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
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gray-900 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Prediction Market Trader</h1>
            <div className="space-x-4">
              <a href="/" className="hover:text-blue-400">Home</a>
              <a href="/dashboard" className="hover:text-blue-400">Dashboard</a>
              <a href="/markets" className="hover:text-blue-400">Markets</a>
              <a href="/arbitrage" className="hover:text-blue-400">Arbitrage</a>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gray-900 text-white p-4 text-center">
          <p>© 2025 Prediction Market Trading Platform</p>
        </footer>
      </body>
    </html>
  )
}

