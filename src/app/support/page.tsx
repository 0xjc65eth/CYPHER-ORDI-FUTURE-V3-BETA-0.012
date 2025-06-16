import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">SUPPORT</h1>
        <h2 className="text-lg text-muted-foreground mb-6">HELP CENTER</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <FAQCard />
          <ContactSupportCard />
        </div>
      </div>
    </main>
  )
}
function FAQCard() {
  return (
    <DashboardCard title="Frequently Asked Questions">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">How do I verify my account?</p>
          <p className="text-sm text-muted-foreground">Follow the verification steps in your account settings.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">What are the trading fees?</p>
          <p className="text-sm text-muted-foreground">Trading fees start at 0.1% and decrease with volume.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">How do I withdraw funds?</p>
          <p className="text-sm text-muted-foreground">Withdrawals can be initiated from your wallet page.</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function ContactSupportCard() {
  return (
    <DashboardCard title="Contact Support">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Email Support</p>
          <p className="text-sm text-muted-foreground">support@example.com</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Live Chat</p>
          <p className="text-sm text-muted-foreground">Available 24/7</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Response Time</p>
          <p className="text-sm text-muted-foreground">Within 24 hours</p>
        </div>
      </div>
    </DashboardCard>
  )
} 