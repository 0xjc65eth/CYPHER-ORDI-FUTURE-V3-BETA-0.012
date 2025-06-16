import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">SECURITY</h1>
        <h2 className="text-lg text-muted-foreground mb-6">SECURITY MEASURES</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <SecurityFeaturesCard />
          <SecurityTipsCard />
        </div>
      </div>
    </main>
  )
}
function SecurityFeaturesCard() {
  return (
    <DashboardCard title="Security Features">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Two-Factor Authentication</p>
          <p className="text-sm text-muted-foreground">Enhanced account security with 2FA.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Encryption</p>
          <p className="text-sm text-muted-foreground">End-to-end encryption for all transactions.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Cold Storage</p>
          <p className="text-sm text-muted-foreground">Majority of assets stored in cold wallets.</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function SecurityTipsCard() {
  return (
    <DashboardCard title="Security Tips">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Strong Passwords</p>
          <p className="text-sm text-muted-foreground">Use unique, complex passwords for your account.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Device Security</p>
          <p className="text-sm text-muted-foreground">Keep your devices updated and secure.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Phishing Awareness</p>
          <p className="text-sm text-muted-foreground">Be cautious of suspicious emails and links.</p>
        </div>
      </div>
    </DashboardCard>
  )
} 