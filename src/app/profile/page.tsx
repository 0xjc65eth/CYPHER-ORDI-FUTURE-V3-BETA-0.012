import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">PROFILE</h1>
        <h2 className="text-lg text-muted-foreground mb-6">USER INFORMATION</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <PersonalInfoCard />
          <TradingStatsCard />
        </div>
      </div>
    </main>
  )
}
function PersonalInfoCard() {
  return (
    <DashboardCard title="Personal Information">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Name</p>
          <p className="text-sm text-muted-foreground">John Doe</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Email</p>
          <p className="text-sm text-muted-foreground">john.doe@example.com</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Member Since</p>
          <p className="text-sm text-muted-foreground">January 2024</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function TradingStatsCard() {
  return (
    <DashboardCard title="Trading Statistics">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Total Trades</p>
          <p className="text-sm text-muted-foreground">156</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Win Rate</p>
          <p className="text-sm text-muted-foreground">68%</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Average Trade Duration</p>
          <p className="text-sm text-muted-foreground">2.5 hours</p>
        </div>
      </div>
    </DashboardCard>
  )
} 