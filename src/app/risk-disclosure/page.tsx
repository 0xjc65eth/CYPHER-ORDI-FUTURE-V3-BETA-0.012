'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RiskDisclosurePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Risk Disclosure</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Cryptocurrency markets involve significant risks:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>High price volatility</li>
                <li>Market manipulation risks</li>
                <li>Liquidity risks</li>
                <li>Regulatory uncertainty</li>
                <li>Global market influences</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Be aware of these technical risks:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Network downtime</li>
                <li>Smart contract vulnerabilities</li>
                <li>Wallet security risks</li>
                <li>Software bugs</li>
                <li>Network congestion</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investment Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Consider these investment-related risks:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Potential for total loss</li>
                <li>Lack of historical data</li>
                <li>Market manipulation</li>
                <li>Limited regulation</li>
                <li>Complex valuation methods</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Be mindful of these operational risks:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Exchange downtime</li>
                <li>Custody risks</li>
                <li>Transaction delays</li>
                <li>API failures</li>
                <li>Third-party risks</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legal and Regulatory Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Consider these legal and regulatory risks:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Changing regulations</li>
                <li>Tax implications</li>
                <li>Cross-border restrictions</li>
                <li>Asset classification uncertainty</li>
                <li>Compliance requirements</li>
              </ul>
              <p className="mt-4 font-semibold">
                Important: Trading cryptocurrencies involves substantial risk of loss and is not suitable for all investors. Please ensure that you fully understand the risks involved and seek independent advice if necessary.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 