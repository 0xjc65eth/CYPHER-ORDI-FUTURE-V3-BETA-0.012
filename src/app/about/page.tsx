'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">About</h1>
          <h2 className="text-lg text-muted-foreground mb-6">CYPHER ORDI FUTURE v3.0.0</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>About This Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                CYPHER ORDI FUTURE é uma plataforma avançada de análise Bitcoin com IA.
              </p>
              <p className="text-sm">
                Desenvolvido com Next.js 14, TypeScript, TensorFlow.js e Supabase.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}