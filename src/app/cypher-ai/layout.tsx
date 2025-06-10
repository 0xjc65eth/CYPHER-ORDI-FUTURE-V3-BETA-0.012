import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CYPHER AI v2 - Advanced Trading Intelligence',
  description: 'AI-powered Bitcoin and cryptocurrency analysis with voice interaction',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function CypherAILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`} suppressHydrationWarning>
        <div id="cypher-ai-root" className="w-full h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}