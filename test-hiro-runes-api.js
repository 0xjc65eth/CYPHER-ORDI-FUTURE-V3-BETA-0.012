#!/usr/bin/env node

// Script de teste para as rotas Hiro Runes API
// Execute com: node test-hiro-runes-api.js

const BASE_URL = 'http://localhost:3000/api/runes';

// Cores para o console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, expectedFields = []) {
  try {
    log(`\n${colors.bold}🧪 Testando: ${name}${colors.reset}`, 'blue');
    log(`📡 URL: ${url}`, 'yellow');
    
    const startTime = Date.now();
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;
    
    log(`⏱️  Tempo de resposta: ${responseTime}ms`, 'yellow');
    log(`📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (!response.ok) {
      log(`❌ Erro HTTP: ${response.status} ${response.statusText}`, 'red');
      return false;
    }
    
    const data = await response.json();
    
    // Verificar estrutura básica da resposta
    const requiredFields = ['success', 'data', 'source', 'timestamp'];
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      log(`❌ Campos obrigatórios ausentes: ${missingFields.join(', ')}`, 'red');
      return false;
    }
    
    if (!data.success) {
      log(`❌ Resposta indica falha: ${data.error || 'Erro desconhecido'}`, 'red');
      return false;
    }
    
    // Verificar campos específicos esperados nos dados
    if (expectedFields.length > 0) {
      const dataObj = data.data;
      const missingDataFields = expectedFields.filter(field => !(field in dataObj));
      
      if (missingDataFields.length > 0) {
        log(`⚠️  Campos esperados ausentes nos dados: ${missingDataFields.join(', ')}`, 'yellow');
      }
    }
    
    // Mostrar informações sobre os dados retornados
    if (data.data.results && Array.isArray(data.data.results)) {
      log(`📦 Resultados retornados: ${data.data.results.length}`, 'green');
      if (data.data.total !== undefined) {
        log(`📊 Total disponível: ${data.data.total}`, 'green');
      }
    }
    
    if (data.cached !== undefined) {
      log(`💾 Cache: ${data.cached ? 'HIT' : 'MISS'}`, data.cached ? 'green' : 'yellow');
    }
    
    log(`✅ Teste passou!`, 'green');
    return true;
    
  } catch (error) {
    log(`❌ Erro durante teste: ${error.message}`, 'red');
    if (error.code === 'ECONNREFUSED') {
      log(`🔌 Servidor parece estar offline. Execute 'npm run dev' primeiro.`, 'red');
    }
    return false;
  }
}

async function runAllTests() {
  log(`${colors.bold}🚀 Iniciando testes das rotas Hiro Runes API${colors.reset}`, 'blue');
  log(`${colors.bold}================================================${colors.reset}`, 'blue');
  
  const tests = [
    {
      name: 'Etchings - Lista básica',
      url: `${BASE_URL}/etchings?limit=5`,
      expectedFields: ['limit', 'offset', 'total', 'results']
    },
    {
      name: 'Etchings - Com paginação',
      url: `${BASE_URL}/etchings?limit=10&offset=5&order=desc&order_by=timestamp`,
      expectedFields: ['limit', 'offset', 'total', 'results']
    },
    {
      name: 'Holders - Rune existente',
      url: `${BASE_URL}/holders/LOBOVERSE?limit=5`,
      expectedFields: ['etching', 'limit', 'offset', 'results']
    },
    {
      name: 'Holders - Com ordenação por balance',
      url: `${BASE_URL}/holders/UNCOMMON•GOODS?limit=3&order=desc&order_by=balance`,
      expectedFields: ['etching', 'limit', 'offset', 'results']
    },
    {
      name: 'Activity - Rune existente',
      url: `${BASE_URL}/activity/UNCOMMON•GOODS?limit=5`,
      expectedFields: ['etching', 'limit', 'offset', 'results']
    },
    {
      name: 'Activity - Filtrada por operação',
      url: `${BASE_URL}/activity/LOBOVERSE?limit=3&operation=transfer`,
      expectedFields: ['etching', 'limit', 'offset', 'results']
    },
    {
      name: 'Price Data - Dados gerais',
      url: `${BASE_URL}/price-data?limit=5&interval=1h&period=24h`,
      expectedFields: ['interval', 'period', 'results']
    },
    {
      name: 'Price Data - Símbolos específicos',
      url: `${BASE_URL}/price-data?symbols=UNCOMMON•GOODS,DOG•GO•TO•THE•MOON&interval=4h`,
      expectedFields: ['interval', 'period', 'results']
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    const passed = await testEndpoint(test.name, test.url, test.expectedFields);
    if (passed) {
      passedTests++;
    }
    
    // Pequena pausa entre testes para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Testes de validação de parâmetros
  log(`\n${colors.bold}🔍 Testando validação de parâmetros${colors.reset}`, 'blue');
  
  const validationTests = [
    {
      name: 'Etchings - Limit inválido',
      url: `${BASE_URL}/etchings?limit=2000`,
      shouldFail: true
    },
    {
      name: 'Etchings - Offset negativo',
      url: `${BASE_URL}/etchings?offset=-1`,
      shouldFail: true
    },
    {
      name: 'Holders - Rune name inválido',
      url: `${BASE_URL}/holders/invalid-rune-name-123`,
      shouldFail: true
    },
    {
      name: 'Price Data - Interval inválido',
      url: `${BASE_URL}/price-data?interval=invalid`,
      shouldFail: true
    }
  ];
  
  for (const test of validationTests) {
    try {
      log(`\n${colors.bold}🧪 Testando: ${test.name}${colors.reset}`, 'blue');
      log(`📡 URL: ${test.url}`, 'yellow');
      
      const response = await fetch(test.url);
      const data = await response.json();
      
      if (test.shouldFail) {
        if (response.status >= 400 || !data.success) {
          log(`✅ Validação funcionou - retornou erro como esperado`, 'green');
          passedTests++;
        } else {
          log(`❌ Validação falhou - deveria ter retornado erro`, 'red');
        }
      }
      
      totalTests++;
      
    } catch (error) {
      log(`❌ Erro durante teste de validação: ${error.message}`, 'red');
      totalTests++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Resumo final
  log(`\n${colors.bold}📊 RESUMO DOS TESTES${colors.reset}`, 'blue');
  log(`${colors.bold}===================${colors.reset}`, 'blue');
  log(`✅ Testes passou: ${passedTests}`, 'green');
  log(`❌ Testes falharam: ${totalTests - passedTests}`, passedTests === totalTests ? 'green' : 'red');
  log(`📊 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log(`\n🎉 Todos os testes passaram! As APIs estão funcionando corretamente.`, 'green');
  } else {
    log(`\n⚠️  Alguns testes falharam. Verifique os erros acima.`, 'yellow');
  }
  
  // Informações adicionais
  log(`\n${colors.bold}ℹ️  INFORMAÇÕES ADICIONAIS${colors.reset}`, 'blue');
  log(`${colors.bold}=========================${colors.reset}`, 'blue');
  log(`🔧 Para executar os testes:`);
  log(`   1. Inicie o servidor: npm run dev`);
  log(`   2. Execute este script: node test-hiro-runes-api.js`);
  log(`\n📚 Documentação completa: src/app/api/runes/README.md`);
  log(`⚙️  Configuração da API: src/lib/api/hiro-runes-config.ts`);
  log(`\n🌐 Endpoints disponíveis:`);
  log(`   • GET /api/runes/etchings`);
  log(`   • GET /api/runes/holders/[etching]`);
  log(`   • GET /api/runes/activity/[etching]`);
  log(`   • GET /api/runes/price-data`);
}

// Executar testes
if (require.main === module) {
  runAllTests().catch(error => {
    log(`💥 Erro fatal durante execução dos testes: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testEndpoint, runAllTests };