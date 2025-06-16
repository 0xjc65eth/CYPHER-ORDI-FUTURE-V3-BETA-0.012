import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">PARTNERS</h1>
        <h2 className="text-lg text-muted-foreground mb-6">OUR PARTNERS</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <PartnerProgramCard />
          <CurrentPartnersCard />
        </div>
      </div>
    </main>
  )
}
function PartnerProgramCard() {
  return (
    <DashboardCard title="Partner Program">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Affiliate Program</p>
          <p className="text-sm text-muted-foreground">Earn commissions by referring new users.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Institutional Partners</p>
          <p className="text-sm text-muted-foreground">Special programs for financial institutions.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Technology Partners</p>
          <p className="text-sm text-muted-foreground">Integration opportunities for tech companies.</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function CurrentPartnersCard() {
  return (
    <DashboardCard title="Current Partners">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Payment Processors</p>
          <p className="text-sm text-muted-foreground">Leading payment solution providers.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Security Providers</p>
          <p className="text-sm text-muted-foreground">Top cybersecurity companies.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Data Providers</p>
          <p className="text-sm text-muted-foreground">Market data and analytics partners.</p>
        </div>
      </div>
    </DashboardCard>
  )
} 