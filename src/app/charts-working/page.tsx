import WorkingChartSystem from '@/components/charts/WorkingChartSystem'

export default function ChartsWorkingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ✅ Working Charts - CYPHER ORDI FUTURE v3.1.0
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simplified chart system with verified working components - SimpleChart and RechartsChart integration.
          </p>
        </div>
        
        <WorkingChartSystem />
      </div>
    </div>
  )
}