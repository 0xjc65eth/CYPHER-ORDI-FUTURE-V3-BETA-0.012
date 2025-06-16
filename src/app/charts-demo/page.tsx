import ChartExample from '@/components/charts/ChartExample'

export default function ChartsDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            📊 Charts Demo - CYPHER ORDI FUTURE v3.1.0
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional-grade chart system with automatic provider selection, 
            error boundaries, and optimized performance for Bitcoin analytics.
          </p>
        </div>
        
        <ChartExample />
      </div>
    </div>
  )
}