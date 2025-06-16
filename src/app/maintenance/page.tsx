import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">MAINTENANCE</h1>
        <h2 className="text-lg text-muted-foreground mb-6">SYSTEM MAINTENANCE</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <MaintenanceDetailsCard />
          <MaintenanceScheduleCard />
        </div>
      </div>
    </main>
  )
}
function MaintenanceDetailsCard() {
  return (
    <DashboardCard title="Maintenance Details">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Status</p>
          <p className="text-sm text-yellow-500">Scheduled Maintenance</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Type</p>
          <p className="text-sm text-muted-foreground">System Update</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Impact</p>
          <p className="text-sm text-muted-foreground">Some services may be temporarily unavailable</p>
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
          <p className="text-sm font-medium">Start Time</p>
          <p className="text-sm text-muted-foreground">April 1, 2024 • 02:00 UTC</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Duration</p>
          <p className="text-sm text-muted-foreground">2 hours</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">End Time</p>
          <p className="text-sm text-muted-foreground">April 1, 2024 • 04:00 UTC</p>
        </div>
      </div>
    </DashboardCard>
  )
} 