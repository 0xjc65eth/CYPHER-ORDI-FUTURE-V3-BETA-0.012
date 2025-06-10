export default function LoadingPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-orange-500 rounded-full animate-spin border-t-transparent absolute inset-0"></div>
        </div>
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    </main>
  )
}
