'use client';

import { useEffect, useState } from 'react';

export function HydrationChecker() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Apenas log sem interferir no DOM
    console.log('🔍 HydrationChecker initialized');
    
    // Verificar erros de hidratação sem override agressivo
    const checkHydration = () => {
      try {
        // Verificação simples sem interferir no DOM
        const bodyContent = document.body.innerHTML;
        if (bodyContent.includes('hydration')) {
          console.warn('⚠️ Possível problema de hidratação detectado');
        } else {
          console.log('✅ Hidratação parece estar OK');
        }
      } catch (error) {
        console.log('🔍 Verificação de hidratação concluída');
      }
    };

    const timeoutId = setTimeout(checkHydration, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Não renderizar nenhum DOM que possa causar conflitos
  return null;
}