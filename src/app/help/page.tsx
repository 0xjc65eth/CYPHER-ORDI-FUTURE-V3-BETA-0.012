import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function HelpPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">HELP</h1>
        <h2 className="text-lg text-muted-foreground mb-6">CUSTOMER SUPPORT</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <SupportOptionsCard />
          <CommonIssuesCard />
        </div>
      </div>
    </main>
  )
}
function SupportOptionsCard() {
  return (
    <DashboardCard title="Support Options">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Live Chat</p>
          <p className="text-sm text-muted-foreground">Available 24/7 for immediate assistance.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Email Support</p>
          <p className="text-sm text-muted-foreground">support@example.com</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Phone Support</p>
          <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function CommonIssuesCard() {
  return (
    <DashboardCard title="Common Issues">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Login Problems</p>
          <p className="text-sm text-muted-foreground">Reset your password or clear browser cache.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Transaction Issues</p>
          <p className="text-sm text-muted-foreground">Check transaction history and network status.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Account Verification</p>
          <p className="text-sm text-muted-foreground">Complete KYC process for full access.</p>
        </div>
      </div>
    </DashboardCard>
  )
} 