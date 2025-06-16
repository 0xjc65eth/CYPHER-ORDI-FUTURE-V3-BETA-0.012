import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function WalletPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">WALLET</h1>
        <h2 className="text-lg text-muted-foreground mb-6">BALANCE & TRANSACTIONS</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <BalanceCard />
          <RecentTransactionsCard />
        </div>
      </div>
    </main>
  )
}
function BalanceCard() {
  return (
    <DashboardCard title="Current Balance">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Total Balance</p>
          <p className="text-2xl font-bold">$25,678.45</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Available for Trading</p>
          <p className="text-sm text-muted-foreground">$20,000.00</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">In Open Positions</p>
          <p className="text-sm text-muted-foreground">$5,678.45</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function RecentTransactionsCard() {
  return (
    <DashboardCard title="Recent Transactions">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Last Deposit</p>
          <p className="text-sm text-muted-foreground">$1,000.00 - 2 days ago</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Last Withdrawal</p>
          <p className="text-sm text-muted-foreground">$500.00 - 1 week ago</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Last Trade</p>
          <p className="text-sm text-muted-foreground">$250.00 profit - 3 hours ago</p>
        </div>
      </div>
    </DashboardCard>
  )
} 