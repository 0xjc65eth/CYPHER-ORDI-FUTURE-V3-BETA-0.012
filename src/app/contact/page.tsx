import { Header } from '@/components/header'
import { DashboardCard } from '@/components/dashboard-card'
export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">CONTACT</h1>
        <h2 className="text-lg text-muted-foreground mb-6">GET IN TOUCH</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ContactInfoCard />
          <ContactFormCard />
        </div>
      </div>
    </main>
  )
}
function ContactInfoCard() {
  return (
    <DashboardCard title="Contact Information">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Email</p>
          <p className="text-sm text-muted-foreground">contact@example.com</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Phone</p>
          <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Address</p>
          <p className="text-sm text-muted-foreground">123 Trading Street, Financial District</p>
        </div>
      </div>
    </DashboardCard>
  )
}
function ContactFormCard() {
  return (
    <DashboardCard title="Send Message">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Name</p>
          <input type="text" className="w-full p-2 border rounded" placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Email</p>
          <input type="email" className="w-full p-2 border rounded" placeholder="Your email" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Message</p>
          <textarea className="w-full p-2 border rounded" rows={4} placeholder="Your message"></textarea>
        </div>
        <button className="w-full bg-primary text-primary-foreground p-2 rounded">
          Send Message
        </button>
      </div>
    </DashboardCard>
  )
} 