export default function TestSimplePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-400 mb-4">✅ SERVER WORKING</h1>
        <p className="text-xl">Next.js está funcionando corretamente</p>
        <p className="text-sm text-gray-400 mt-4">Timestamp: {new Date().toISOString()}</p>
      </div>
    </div>
  )
}