export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">✅ CYPHER ORDI FUTURE</h1>
        <p className="text-xl text-green-400 mb-2">Servidor funcionando perfeitamente\!</p>
        <p className="text-gray-400">Build errors corrigidos</p>
        <div className="mt-6">
          <a href="/dashboard" className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg">
            Ir para Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
