import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CYPHER ORDI FUTURE V3.0.0',
  description: 'Bitcoin Analytics Platform - Funcionando Perfeitamente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}