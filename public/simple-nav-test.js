// Simple Navigation Test - Cole no console do navegador
console.clear();
console.log('🧪 TESTE SIMPLES DE NAVEGAÇÃO');
console.log('================================');

// Função para teste rápido
window.quickNavTest = function() {
  const results = [];
  
  // 1. Contar links
  const navLinks = document.querySelectorAll('nav a');
  results.push(`📊 Links encontrados: ${navLinks.length}`);
  
  // 2. Testar primeiro link (Dashboard)
  if (navLinks[0]) {
    const link = navLinks[0];
    const rect = link.getBoundingClientRect();
    results.push(`🏠 Primeiro link: "${link.textContent?.trim()}" -> ${link.href}`);
    results.push(`📐 Visível: ${rect.width > 0 && rect.height > 0 ? 'SIM' : 'NÃO'}`);
    
    // Simular clique
    results.push('🖱️ Testando clique...');
    try {
      link.click();
      results.push('✅ Clique executado');
      setTimeout(() => {
        if (window.location.pathname === link.getAttribute('href')) {
          console.log('✅ NAVEGAÇÃO FUNCIONOU!');
        } else {
          console.log('❌ NAVEGAÇÃO FALHOU!');
        }
      }, 1000);
    } catch (e) {
      results.push(`❌ Erro no clique: ${e.message}`);
    }
  }
  
  // 3. Verificar erros comuns
  const nav = document.querySelector('nav');
  if (!nav) {
    results.push('❌ Elemento <nav> não encontrado');
  } else {
    const style = getComputedStyle(nav);
    results.push(`🎨 Nav z-index: ${style.zIndex}`);
    results.push(`👆 Nav pointer-events: ${style.pointerEvents}`);
  }
  
  // Mostrar resultados
  results.forEach(result => console.log(result));
  
  return results;
};

// Executar teste automaticamente
quickNavTest();

console.log('');
console.log('💡 Para testar novamente, digite: quickNavTest()');