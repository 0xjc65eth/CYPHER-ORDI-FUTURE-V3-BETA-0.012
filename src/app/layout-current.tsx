import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DEFAULT_META } from '@/lib/constants/routes'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: DEFAULT_META.title,
  description: DEFAULT_META.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}