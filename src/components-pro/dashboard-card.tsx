import { cn } from '@/lib/utils'

interface DashboardCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function DashboardCard({ title, children, className }: DashboardCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <h2 className="text-lg font-semibold text-card-foreground mb-4">{title}</h2>
      {children}
    </div>
  )
} 