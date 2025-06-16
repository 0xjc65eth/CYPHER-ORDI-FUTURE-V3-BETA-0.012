#!/usr/bin/env node

/**
 * 🧪 TESTE HIRO API INTERFACE FIXES
 * Verifica se todos os métodos implementados funcionam corretamente
 */

const { hiroAPI } = require('./src/lib/hiro-api.ts');

async function testHiroAPIFixes() {
  console.log('🧪 INICIANDO TESTE HIRO API INTERFACE FIXES...\n');

  const tests = [
    {
      name: 'getNetworkInfo()',
      test: () => hiroAPI.getNetworkInfo()
    },
    {
      name: 'getOrdinalsCollections()',
      test: () => hiroAPI.getOrdinalsCollections(0, 5)
    },
    {
      name: 'getRunesInfo()',
      test: () => hiroAPI.getRunesInfo()
    },
    {
      name: 'getMempoolStats()',
      test: () => hiroAPI.getMempoolStats()
    },
    {
      name: 'getFeeEstimates()',
      test: () => hiroAPI.getFeeEstimates()
    },
    {
      name: 'getRunes() - existing method',
      test: () => hiroAPI.getRunes(0, 3)
    },
    {
      name: 'getBRC20ForAddress() - existing method',
      test: () => hiroAPI.getBRC20ForAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    try {
      console.log(`🔍 Testing ${name}...`);
      const startTime = Date.now();
      const result = await test();
      const duration = Date.now() - startTime;
      
      if (result && !result.error) {
        console.log(`✅ ${name} - PASSED (${duration}ms)`);
        console.log(`   Result keys: ${Object.keys(result).join(', ')}\n`);
        passed++;
      } else {
        console.log(`❌ ${name} - FAILED: ${result?.error || 'No data returned'}\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${name} - ERROR: ${error.message}\n`);
      failed++;
    }
  }

  // API Metrics
  console.log('📊 API METRICS:');
  const metrics = hiroAPI.getMetrics();
  console.log(`   Total Requests: ${metrics.totalRequests}`);
  console.log(`   Success Rate: ${metrics.successRate.toFixed(1)}%`);
  console.log(`   Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%`);
  console.log(`   Average Response Time: ${metrics.averageResponseTime.toFixed(1)}ms`);

  // Cache Stats
  console.log('\n💾 CACHE STATS:');
  const cacheStats = hiroAPI.getCacheStats();
  console.log(`   Total Entries: ${cacheStats.total}`);
  console.log(`   Valid Entries: ${cacheStats.valid}`);
  console.log(`   Hit Ratio: ${cacheStats.hitRatio.toFixed(1)}%`);

  // Summary
  console.log('\n📋 SUMMARY:');
  console.log(`✅ Tests Passed: ${passed}`);
  console.log(`❌ Tests Failed: ${failed}`);
  console.log(`📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! HIRO API interface fixes are working correctly.');
  } else {
    console.log('\n⚠️ SOME TESTS FAILED. Please review the errors above.');
  }

  return failed === 0;
}

// Execute test if run directly
if (require.main === module) {
  testHiroAPIFixes()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testHiroAPIFixes };