"use client"

import Link from 'next/link'

export default function ErrorPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-2">Error</h1>
          <p className="text-lg text-muted-foreground">An unexpected error occurred</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Error Details</h3>
            <p className="text-red-500">500 Internal Server Error</p>
            <p className="text-sm text-muted-foreground mt-1">
              An unexpected error occurred on our servers. Our team has been notified.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">What you can do:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Refresh the page</li>
              <li>Check our <Link href="/status" className="text-orange-500 hover:underline">system status</Link></li>
              <li>Clear your browser cache</li>
              <li>Try again in a few minutes</li>
            </ul>
          </div>
          
          <div className="pt-4 border-t">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
