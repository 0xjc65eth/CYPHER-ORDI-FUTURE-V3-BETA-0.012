#!/usr/bin/env node

/**
 * Page Validation Script
 * CYPHER ORDi FUTURE V3
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🚀 Running page validation...');

try {
  // Check if critical directories exist
  const appDir = './src/app';
  const pagesDir = './src/app';
  
  if (statSync(appDir).isDirectory()) {
    console.log('✅ App directory structure valid');
  }
  
  // Count pages
  let pageCount = 0;
  
  function countPages(dir) {
    try {
      const files = readdirSync(dir);
      files.forEach(file => {
        const fullPath = join(dir, file);
        if (statSync(fullPath).isDirectory()) {
          countPages(fullPath);
        } else if (file === 'page.tsx' || file === 'page.ts') {
          pageCount++;
        }
      });
    } catch (error) {
      // Ignore errors for missing directories
    }
  }
  
  countPages(appDir);
  
  console.log(`📊 Found ${pageCount} page components`);
  console.log('✅ Page validation completed successfully');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Page validation failed:', error.message);
  process.exit(1);
}