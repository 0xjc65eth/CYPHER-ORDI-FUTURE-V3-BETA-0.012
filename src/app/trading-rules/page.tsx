'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TradingRulesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Trading Rules</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Trading Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                All users must adhere to these basic trading rules:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintain sufficient balance for trades</li>
                <li>Follow market hours and trading schedules</li>
                <li>Respect trading limits and restrictions</li>
                <li>Use appropriate order types</li>
                <li>Monitor positions regularly</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Manipulation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                The following activities are strictly prohibited:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Wash trading</li>
                <li>Front running</li>
                <li>Spoofing or layering</li>
                <li>Price manipulation</li>
                <li>Coordinated trading</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Users must implement proper risk management:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Set appropriate stop-loss orders</li>
                <li>Diversify trading portfolio</li>
                <li>Monitor market conditions</li>
                <li>Maintain proper position sizing</li>
                <li>Use leverage responsibly</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Maintain account security by:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Using strong passwords</li>
                <li>Enabling two-factor authentication</li>
                <li>Keeping API keys secure</li>
                <li>Regularly reviewing account activity</li>
                <li>Reporting suspicious activity immediately</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Users must comply with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Local trading regulations</li>
                <li>KYC/AML requirements</li>
                <li>Tax reporting obligations</li>
                <li>Platform terms of service</li>
                <li>Trading limits and restrictions</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 