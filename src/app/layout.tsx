import type { Metadata } from 'next'
import './globals.css'
import { PremiumProvider } from '@/contexts/PremiumContext'

export const metadata: Metadata = {
  title: 'CYPHER ORDI FUTURE V3 | Advanced Bitcoin Trading Intelligence',
  description: 'Professional Bitcoin trading platform with AI-powered insights, Ordinals, Runes, and advanced analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-black text-white antialiased">
        <PremiumProvider>
          {children}
        </PremiumProvider>
      </body>
    </html>
  )
}