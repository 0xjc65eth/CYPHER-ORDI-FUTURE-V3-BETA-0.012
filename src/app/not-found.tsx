import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div>
          <h1 className="text-6xl font-bold text-orange-500 mb-2">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/trading"
            className="inline-flex items-center justify-center px-6 py-3 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-500/10 transition-colors"
          >
            Trading Page
          </Link>
        </div>
      </div>
    </main>
  )
}
