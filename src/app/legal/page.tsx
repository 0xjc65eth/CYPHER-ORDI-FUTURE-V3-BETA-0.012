'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Legal Information</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
            <CardDescription>Our platform's terms and conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Review our comprehensive terms of service that govern the use of our platform.
            </p>
            <Link 
              href="/terms" 
              className="text-primary hover:underline"
            >
              View Terms of Service →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <CardDescription>How we handle your data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Learn about how we collect, use, and protect your personal information.
            </p>
            <Link 
              href="/privacy" 
              className="text-primary hover:underline"
            >
              View Privacy Policy →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trading Rules</CardTitle>
            <CardDescription>Guidelines for trading activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Understand our trading rules, limits, and best practices for using our platform.
            </p>
            <Link 
              href="/trading-rules" 
              className="text-primary hover:underline"
            >
              View Trading Rules →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Disclosure</CardTitle>
            <CardDescription>Understanding potential risks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Important information about the risks associated with cryptocurrency trading.
            </p>
            <Link 
              href="/risk-disclosure" 
              className="text-primary hover:underline"
            >
              View Risk Disclosure →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 