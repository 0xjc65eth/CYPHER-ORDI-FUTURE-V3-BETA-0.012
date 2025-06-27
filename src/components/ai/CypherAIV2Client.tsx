'use client'

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic import with no SSR to prevent window/AudioContext issues
const CypherAIV2 = dynamic(() => import('./CypherAIV2'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-300">Inicializando CYPHER AI v2...</h2>
        <p className="text-gray-500 mt-2">Carregando capacidades avançadas de IA</p>
      </div>
    </div>
  )
});

const CypherAIV2Demo = dynamic(() => import('./CypherAIv2Demo'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Inicializando CYPHER AI v2...</h2>
        <p className="text-gray-500 mt-2">Carregando capacidades Gemini-like</p>
      </div>
    </div>
  )
});

export { CypherAIV2, CypherAIV2Demo };
export default CypherAIV2;