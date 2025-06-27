'use client';

import dynamic from 'next/dynamic';

// Carrega SimpleTest dinamicamente, apenas no cliente
const SimpleTest = dynamic(
  () => import('@/components/charts/SimpleTest'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando teste de gráfico...</div>
      </div>
    ),
  }
);

export default function ChartTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🔧 Chart System Test
          </h1>
          <p className="text-muted-foreground">
            Diagnosing chart rendering issues step by step
          </p>
        </div>
        
        <SimpleTest />
      </div>
    </div>
  )
}