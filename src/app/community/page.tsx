import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">COMMUNITY</h1>
        <h2 className="text-lg text-muted-foreground mb-6">JOIN OUR COMMUNITY</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <CommunityPlatformsCard />
          <CommunityEventsCard />
        </div>
      </div>
    </main>
  )
}
function CommunityPlatformsCard() {
  return (
    <DashboardCard title="Community Platforms">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Discord</p>
          <p className="text-sm text-muted-foreground">Join our active Discord community</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Telegram</p>
          <p className="text-sm text-muted-foreground">Stay updated on Telegram</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Twitter</p>
          <p className="text-sm text-muted-foreground">Follow us on Twitter</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function CommunityEventsCard() {
  return (
    <DashboardCard title="Community Events">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Weekly AMA</p>
          <p className="text-sm text-muted-foreground">Every Thursday at 2 PM UTC</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Trading Competition</p>
          <p className="text-sm text-muted-foreground">Monthly trading competitions</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Community Call</p>
          <p className="text-sm text-muted-foreground">First Friday of each month</p>
        </div>
      </div>
    </DashboardCard>
  )
} 