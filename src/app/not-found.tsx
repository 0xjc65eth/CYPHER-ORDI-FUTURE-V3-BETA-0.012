import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-orange-500">404</h1>
        <p className="text-2xl text-gray-400 mb-8">Página não encontrada</p>
        <div className="space-x-4">
          <Link 
            href="/" 
            className="bg-orange-500 text-black px-6 py-3 rounded font-bold hover:bg-orange-400"
          >
            Voltar ao Início
          </Link>
          <Link 
            href="/dashboard" 
            className="bg-gray-800 text-white px-6 py-3 rounded font-bold hover:bg-gray-700"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
