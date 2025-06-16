/**
 * Test script for the new HIRO API methods
 */

const { hiroAPI } = require('./src/lib/hiro-api.ts');

async function testHiroMethods() {
  console.log('🧪 Testing HIRO API Methods Implementation...\n');
  
  try {
    // Test getNetworkInfo
    console.log('1. Testing getNetworkInfo()...');
    const networkInfo = await hiroAPI.getNetworkInfo();
    console.log('✅ Network Info:', {
      network: networkInfo.network,
      status: networkInfo.status,
      block_height: networkInfo.block_height,
      error: networkInfo.error
    });
    
    // Test getOrdinalsCollections
    console.log('\n2. Testing getOrdinalsCollections()...');
    const collections = await hiroAPI.getOrdinalsCollections(0, 2);
    console.log('✅ Collections:', {
      total: collections.total,
      results_count: collections.results.length,
      first_collection: collections.results[0]?.name
    });
    
    // Test getRunesInfo
    console.log('\n3. Testing getRunesInfo()...');
    const runesInfo = await hiroAPI.getRunesInfo();
    console.log('✅ Runes Info:', {
      total_runes: runesInfo.total_runes,
      total_holders: runesInfo.total_holders,
      error: runesInfo.error
    });
    
    // Test getMempoolStats
    console.log('\n4. Testing getMempoolStats()...');
    const mempoolStats = await hiroAPI.getMempoolStats();
    console.log('✅ Mempool Stats:', {
      count: mempoolStats.count,
      source: mempoolStats.source,
      error: mempoolStats.error
    });
    
    // Test getFeeEstimates
    console.log('\n5. Testing getFeeEstimates()...');
    const feeEstimates = await hiroAPI.getFeeEstimates();
    console.log('✅ Fee Estimates:', {
      fastestFee: feeEstimates.fastestFee,
      halfHourFee: feeEstimates.halfHourFee,
      source: feeEstimates.source,
      error: feeEstimates.error
    });
    
    console.log('\n🎉 All HIRO API methods tested successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHiroMethods();