import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/wallstreet.css'
import { Providers } from './providers'
import NotificationSystem from '@/components/notifications/NotificationSystem'
import '@/lib/wallet/walletConflictResolver'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'CYPHER ORDI FUTURE V3.0.0',
  description: 'Bitcoin Analytics Platform',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/wallet-conflict-suppressor.js" async />
        <script src="/wallet-diagnostics.js" async />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <NotificationSystem />
        </Providers>
      </body>
    </html>
  )
}