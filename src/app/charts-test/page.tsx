'use client';

// 📊 Página de Teste - Charts Library CYPHER ORDI FUTURE v3.0.0
import dynamic from 'next/dynamic';

// Carrega ChartDemo dinamicamente, apenas no cliente
const ChartDemo = dynamic(
  () => import('@/components/charts/ChartDemo').then(mod => ({ default: mod.ChartDemo })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange-500">Carregando gráficos...</div>
      </div>
    ),
  }
);

export default function ChartsTestPage() {
  return (
    <div className="min-h-screen bg-black">
      <ChartDemo />
    </div>
  );
}