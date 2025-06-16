import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">SITEMAP</h1>
        <h2 className="text-lg text-muted-foreground mb-6">SITE STRUCTURE</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <MainPagesCard />
          <SupportPagesCard />
        </div>
      </div>
    </main>
  )
}
function MainPagesCard() {
  return (
    <DashboardCard title="Main Pages">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Home</p>
          <p className="text-sm text-muted-foreground">Main landing page</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Trading</p>
          <p className="text-sm text-muted-foreground">Trading platform and tools</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Market</p>
          <p className="text-sm text-muted-foreground">Market overview and analysis</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function SupportPagesCard() {
  return (
    <DashboardCard title="Support Pages">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Help Center</p>
          <p className="text-sm text-muted-foreground">Support and documentation</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">FAQ</p>
          <p className="text-sm text-muted-foreground">Frequently asked questions</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Contact</p>
          <p className="text-sm text-muted-foreground">Get in touch with us</p>
        </div>
      </div>
    </DashboardCard>
  )
} 