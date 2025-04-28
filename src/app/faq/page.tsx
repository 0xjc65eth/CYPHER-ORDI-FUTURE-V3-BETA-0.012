import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">FAQ</h1>
        <h2 className="text-lg text-muted-foreground mb-6">FREQUENTLY ASKED QUESTIONS</h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <GeneralQuestionsCard />
          <TradingQuestionsCard />
        </div>
      </div>
    </main>
  )
}

function GeneralQuestionsCard() {
  return (
    <DashboardCard title="General Questions">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">How do I create an account?</p>
          <p className="text-sm text-muted-foreground">Click the Sign Up button and follow the registration process.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Is my information secure?</p>
          <p className="text-sm text-muted-foreground">Yes, we use industry-standard encryption and security measures.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">What payment methods are accepted?</p>
          <p className="text-sm text-muted-foreground">We accept major credit cards and cryptocurrency payments.</p>
        </div>
      </div>
    </DashboardCard>
  )
}

function TradingQuestionsCard() {
  return (
    <DashboardCard title="Trading Questions">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">How do I start trading?</p>
          <p className="text-sm text-muted-foreground">Deposit funds and use our trading interface to place orders.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">What are the trading fees?</p>
          <p className="text-sm text-muted-foreground">Trading fees start at 0.1% and decrease with volume.</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">How do I withdraw my funds?</p>
          <p className="text-sm text-muted-foreground">Withdrawals can be initiated from your wallet page.</p>
        </div>
      </div>
    </DashboardCard>
  )
} 