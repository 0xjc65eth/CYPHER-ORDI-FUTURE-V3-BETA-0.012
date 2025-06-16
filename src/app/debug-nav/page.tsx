'use client'

import { useState, useEffect } from 'react'
import { TopNavLayout } from '@/components/layout/TopNavLayout'

export default function DebugNavPage() {
  const [results, setResults] = useState<string[]>([])
  const [isTestingNav, setIsTestingNav] = useState(false)

  const testNavigation = async () => {
    setIsTestingNav(true)
    const logs: string[] = []
    
    try {
      // 1. Verificar se os links existem
      const navLinks = document.querySelectorAll('nav a')
      logs.push(`📊 Total de links encontrados: ${navLinks.length}`)
      
      if (navLinks.length === 0) {
        logs.push('❌ PROBLEMA: Nenhum link de navegação encontrado!')
        setResults(logs)
        setIsTestingNav(false)
        return
      }

      // 2. Testar cada link
      for (let i = 0; i < Math.min(5, navLinks.length); i++) {
        const link = navLinks[i] as HTMLAnchorElement
        const rect = link.getBoundingClientRect()
        const href = link.getAttribute('href') || ''
        const text = link.textContent?.trim() || ''
        
        logs.push(`🔗 Link ${i + 1}: "${text}" -> ${href}`)
        logs.push(`   Visível: ${rect.width > 0 && rect.height > 0 ? 'SIM' : 'NÃO'}`)
        logs.push(`   Posição: ${Math.round(rect.left)}, ${Math.round(rect.top)}`)
        
        // Testar clique
        logs.push(`   🖱️ Testando clique...`)
        const originalPath = window.location.pathname
        
        try {
          link.click()
          logs.push(`   ✅ Clique executado`)
          
          // Aguardar navegação
          await new Promise(resolve => setTimeout(resolve, 500))
          
          if (window.location.pathname !== originalPath) {
            logs.push(`   ✅ NAVEGAÇÃO FUNCIONOU! ${originalPath} → ${window.location.pathname}`)
            // Voltar para página de debug
            window.history.back()
            await new Promise(resolve => setTimeout(resolve, 500))
          } else {
            logs.push(`   ❌ NAVEGAÇÃO FALHOU - ainda em ${originalPath}`)
          }
        } catch (error) {
          logs.push(`   ❌ Erro no clique: ${error}`)
        }
        
        logs.push('') // Linha em branco para separar
      }

      // 3. Verificar CSS/JavaScript
      const nav = document.querySelector('nav')
      if (nav) {
        const style = getComputedStyle(nav)
        logs.push(`🎨 Navegação CSS:`)
        logs.push(`   z-index: ${style.zIndex}`)
        logs.push(`   position: ${style.position}`)
        logs.push(`   pointer-events: ${style.pointerEvents}`)
        logs.push(`   display: ${style.display}`)
      }
      
    } catch (error) {
      logs.push(`❌ ERRO GERAL: ${error}`)
    }
    
    setResults(logs)
    setIsTestingNav(false)
  }

  const copyResults = () => {
    const text = results.join('\n')
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Resultados copiados para área de transferência!')
    }).catch(() => {
      alert('❌ Erro ao copiar. Use Ctrl+C manualmente.')
    })
  }

  const downloadResults = () => {
    const text = results.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'navigation-debug-results.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <TopNavLayout>
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">🔧 Debug da Navegação</h1>
          <p className="text-gray-400">Teste automático dos links de navegação</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={testNavigation}
              disabled={isTestingNav}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {isTestingNav ? '🔄 Testando...' : '🧪 Iniciar Teste'}
            </button>
            
            {results.length > 0 && (
              <>
                <button
                  onClick={copyResults}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  📋 Copiar Resultados
                </button>
                
                <button
                  onClick={downloadResults}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  💾 Baixar Arquivo
                </button>
              </>
            )}
          </div>

          {results.length > 0 && (
            <div className="bg-black rounded-lg p-4 font-mono text-sm">
              <h3 className="text-green-400 font-bold mb-4">📊 Resultados do Teste:</h3>
              <div className="space-y-1 text-gray-300 max-h-96 overflow-y-auto">
                {results.map((line, index) => (
                  <div key={index} className={
                    line.includes('❌') ? 'text-red-400' :
                    line.includes('✅') ? 'text-green-400' :
                    line.includes('🔗') ? 'text-blue-400' :
                    line.includes('🎨') ? 'text-purple-400' :
                    'text-gray-300'
                  }>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6">
          <h3 className="text-yellow-400 font-bold mb-2">📋 Instruções:</h3>
          <ol className="space-y-1 text-gray-300 text-sm">
            <li>1. Clique em "Iniciar Teste" para testar a navegação automaticamente</li>
            <li>2. O teste vai verificar se os links estão visíveis e funcionando</li>
            <li>3. Use "Copiar Resultados" ou "Baixar Arquivo" para salvar os logs</li>
            <li>4. Envie os resultados para análise do problema</li>
          </ol>
        </div>
      </div>
    </TopNavLayout>
  )
}