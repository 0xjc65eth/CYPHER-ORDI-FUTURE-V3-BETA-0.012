import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">SETTINGS</h1>
        <h2 className="text-lg text-muted-foreground mb-6">ACCOUNT PREFERENCES</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <AccountSettingsCard />
          <NotificationSettingsCard />
        </div>
      </div>
    </main>
  )
}
function AccountSettingsCard() {
  return (
    <DashboardCard title="Account Settings">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Email Notifications</p>
          <p className="text-sm text-muted-foreground">Enabled</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Two-Factor Authentication</p>
          <p className="text-sm text-muted-foreground">Enabled</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Trading Preferences</p>
          <p className="text-sm text-muted-foreground">Advanced</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function NotificationSettingsCard() {
  return (
    <DashboardCard title="Notification Settings">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Trade Alerts</p>
          <p className="text-sm text-muted-foreground">Enabled</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Price Alerts</p>
          <p className="text-sm text-muted-foreground">Enabled</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">News Updates</p>
          <p className="text-sm text-muted-foreground">Disabled</p>
        </div>
      </div>
    </DashboardCard>
  )
} 