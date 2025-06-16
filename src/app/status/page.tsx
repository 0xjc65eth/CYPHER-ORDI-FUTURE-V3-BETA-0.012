import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function StatusPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">STATUS</h1>
        <h2 className="text-lg text-muted-foreground mb-6">SYSTEM STATUS</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <SystemStatusCard />
          <MaintenanceScheduleCard />
        </div>
      </div>
    </main>
  )
}
function SystemStatusCard() {
  return (
    <DashboardCard title="System Status">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Trading Platform</p>
          <p className="text-sm text-green-500">Operational</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">API Services</p>
          <p className="text-sm text-green-500">Operational</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Website</p>
          <p className="text-sm text-green-500">Operational</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function MaintenanceScheduleCard() {
  return (
    <DashboardCard title="Maintenance Schedule">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Next Maintenance</p>
          <p className="text-sm text-muted-foreground">April 1, 2024 • 02:00 UTC</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Duration</p>
          <p className="text-sm text-muted-foreground">2 hours</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Impact</p>
          <p className="text-sm text-muted-foreground">Minimal service interruption</p>
        </div>
      </div>
    </DashboardCard>
  )
} 