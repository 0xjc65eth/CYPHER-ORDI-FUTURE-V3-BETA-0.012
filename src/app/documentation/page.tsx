'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DocumentationPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Documentation</h1>
          <h2 className="text-lg text-muted-foreground mb-6">API & Developer Guide</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                API documentation and developer guides will be displayed here.
              </p>
              <p className="text-sm">Under Development</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}