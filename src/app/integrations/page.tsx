'use client'

import { TopNavLayout } from '@/components/layout/TopNavLayout'
import GitHubIntegration from '@/components/integrations/GitHubIntegration'
import DiscordIntegration from '@/components/integrations/DiscordIntegration'
import EmailIntegration from '@/components/integrations/EmailIntegration'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Zap, Shield, Webhook } from 'lucide-react'

export default function IntegrationsPage() {
  return (
    <TopNavLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Integrations</h1>
          <p className="text-gray-400">Connect external services to enhance your CYPHER ORDI FUTURE experience</p>
        </div>

        {/* Integration Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">3</div>
                <div className="text-sm text-gray-400">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">0</div>
                <div className="text-sm text-gray-400">Connected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">0</div>
                <div className="text-sm text-gray-400">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GitHubIntegration />
          <DiscordIntegration />
          <EmailIntegration />
        </div>

        {/* Coming Soon */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-purple-400" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {['Telegram', 'Slack', 'Twitter/X', 'Webhook'].map(service => (
                <div key={service} className="p-3 bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-300">{service}</div>
                  <div className="text-xs text-gray-500 mt-1">Soon</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TopNavLayout>
  )
}