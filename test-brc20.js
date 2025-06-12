#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testBRC20Page() {
  console.log('🔍 Starting BRC20 page test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`🌐 [BROWSER ${type.toUpperCase()}] ${text}`);
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.log(`🚨 [PAGE ERROR] ${error.message}`);
  });
  
  // Listen to request failures
  page.on('requestfailed', request => {
    console.log(`❌ [REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`);
  });
  
  try {
    console.log('🔍 Navigating to BRC20 page...');
    await page.goto('http://localhost:3000/brc20', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('✅ Page loaded successfully');
    
    // Wait a bit for React to render
    await page.waitForTimeout(5000);
    
    // Check if page has content
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('📄 Page content preview:', bodyText.substring(0, 200) + '...');
    
    // Check for specific elements
    const hasHeader = await page.$('h1');
    const hasCards = await page.$$('.bg-gray-900');
    
    console.log('🔍 Page analysis:');
    console.log('  - Has header:', !!hasHeader);
    console.log('  - Number of cards:', hasCards.length);
    console.log('  - Body text length:', bodyText.length);
    
    if (bodyText.length < 100) {
      console.log('⚠️ Page appears to have minimal content (possible black screen)');
    } else {
      console.log('✅ Page appears to have content');
    }
    
    // Take a screenshot
    await page.screenshot({ path: '/tmp/brc20-test.png', fullPage: true });
    console.log('📸 Screenshot saved to /tmp/brc20-test.png');
    
  } catch (error) {
    console.error('❌ Error testing page:', error.message);
  }
  
  console.log('🔍 Test completed. Keeping browser open for manual inspection...');
  // Don't close browser so we can inspect manually
  // await browser.close();
}

testBRC20Page().catch(console.error);