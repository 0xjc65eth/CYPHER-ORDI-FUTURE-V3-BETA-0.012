'use client'

import React, { useEffect } from 'react'

export function BigIntTest() {
  useEffect(() => {
    // Executar testes automaticamente quando o componente montar
    console.log('🧪 BigIntTest Component: Running automatic tests...')
    
    try {
      // Teste 1: Verificar patches aplicados
      console.log('📊 Patches aplicados:')
      console.log('  - Simple BigInt Polyfill:', (window as any).__simpleBigIntPolyfillApplied || false)
      console.log('  - LaserEyes BigInt Patch:', (window as any).__laserEyesBigIntPatchApplied || false)
      
      // Teste 2: Math.pow com BigInt
      const bigNum = BigInt(10)
      const result = Math.pow(bigNum as any, 2)
      console.log('✅ Math.pow(BigInt(10), 2) =', result)
      
      // Teste 3: JSON com BigInt
      const obj = { value: BigInt(123456789) }
      const json = JSON.stringify(obj)
      console.log('✅ JSON.stringify com BigInt:', json)
      
      // Teste 4: Parse JSON
      const parsed = JSON.parse(json)
      console.log('✅ JSON.parse com BigInt:', parsed)
      
      // Teste 5: Math.max/min com BigInt
      const maxResult = Math.max(BigInt(5) as any, BigInt(10) as any)
      console.log('✅ Math.max com BigInt:', maxResult)
      
      console.log('🎉 Todos os testes BigInt passaram!')
      
      // Se walletDiagnostics estiver disponível, executar teste completo
      if ((window as any).walletDiagnostics) {
        console.log('🔍 Executando diagnóstico completo...')
        ;(window as any).walletDiagnostics.testBigInt()
      }
    } catch (error) {
      console.error('❌ Erro no teste BigInt:', error)
    }
  }, [])
  
  return null // Componente invisível
}

export default BigIntTest