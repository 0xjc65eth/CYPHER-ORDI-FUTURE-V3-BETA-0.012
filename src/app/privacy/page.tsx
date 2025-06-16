'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Collection and Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                We collect and process your personal information to provide you with our services. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (email, username)</li>
                <li>Wallet addresses and transaction history</li>
                <li>Trading activity and preferences</li>
                <li>Device and browser information</li>
                <li>IP addresses and location data</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                We implement robust security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>End-to-end encryption for sensitive data</li>
                <li>Regular security audits and updates</li>
                <li>Secure data storage and transmission</li>
                <li>Access controls and authentication</li>
                <li>Regular backups and disaster recovery</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sharing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                We may share your data with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service providers and partners</li>
                <li>Regulatory authorities when required</li>
                <li>Law enforcement agencies when legally obligated</li>
              </ul>
              <p>
                We never sell your personal data to third parties.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Request data correction or deletion</li>
                <li>Object to data processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              For any privacy-related concerns or requests, please contact our Data Protection Officer at:
              <br />
              Email: privacy@cypherordifuture.com
              <br />
              Address: 123 Blockchain Street, Crypto City, CC 12345
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 