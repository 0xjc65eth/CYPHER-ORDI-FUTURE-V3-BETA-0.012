import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function PressPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">PRESS</h1>
        <h2 className="text-lg text-muted-foreground mb-6">NEWS & MEDIA</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <PressReleasesCard />
          <MediaKitCard />
        </div>
      </div>
    </main>
  )
}
function PressReleasesCard() {
  return (
    <DashboardCard title="Press Releases">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Platform Launch Announcement</p>
          <p className="text-sm text-muted-foreground">March 15, 2024</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">New Trading Features Released</p>
          <p className="text-sm text-muted-foreground">March 10, 2024</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Security Update Announcement</p>
          <p className="text-sm text-muted-foreground">March 5, 2024</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function MediaKitCard() {
  return (
    <DashboardCard title="Media Kit">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Company Logo</p>
          <p className="text-sm text-muted-foreground">High-resolution logo files</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Brand Guidelines</p>
          <p className="text-sm text-muted-foreground">Visual identity and usage rules</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Press Contact</p>
          <p className="text-sm text-muted-foreground">press@example.com</p>
        </div>
      </div>
    </DashboardCard>
  )
} 