import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function NewsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">NEWS</h1>
        <h2 className="text-lg text-muted-foreground mb-6">MARKET NEWS</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <LatestNewsCard />
          <MarketSentimentCard />
        </div>
      </div>
    </main>
  )
}
function LatestNewsCard() {
  return (
    <DashboardCard title="Latest News">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Bitcoin Surges Past $50,000</p>
          <p className="text-sm text-muted-foreground">2 hours ago</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">New SEC Regulations Proposed</p>
          <p className="text-sm text-muted-foreground">5 hours ago</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Ethereum 2.0 Update</p>
          <p className="text-sm text-muted-foreground">8 hours ago</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function MarketSentimentCard() {
  return (
    <DashboardCard title="Market Sentiment">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Overall Sentiment</p>
          <p className="text-sm text-green-500">Bullish</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Fear & Greed Index</p>
          <p className="text-sm text-muted-foreground">65</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Social Media Activity</p>
          <p className="text-sm text-muted-foreground">High</p>
        </div>
      </div>
    </DashboardCard>
  )
} 