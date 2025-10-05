#!/usr/bin/env node

/**
 * Bundle Analyzer Script
 * 
 * This script runs the Next.js bundle analyzer to help identify large dependencies
 * and optimize the bundle size.
 * 
 * Usage:
 *   node scripts/analyze-bundle.js [--production]
 * 
 * Options:
 *   --production  Analyze the production build (default: development)
 */

const { execSync } = require('child_process');
const _path = require('path');
const _fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const isProduction = args.includes('--production');

// Set environment variables
process.env.ANALYZE = 'true';
process.env.NODE_ENV = isProduction ? 'production' : 'development';

console.log(`Analyzing bundle in ${isProduction ? 'production' : 'development'} mode...`);

try {
  // Run the Next.js build with bundle analyzer
  execSync(`next build`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ANALYZE: 'true',
    },
  });

  console.log('\nBundle analysis complete!');
  console.log('Check the browser for the bundle analysis report.');
  console.log('\nCommon optimization tips:');
  console.log('1. Use dynamic imports for large components that are not needed on initial load');
  console.log('2. Consider replacing large libraries with smaller alternatives');
  console.log('3. Use tree-shakeable libraries when possible');
  console.log('4. Implement code splitting for different routes');
  console.log('5. Lazy load images and components that are below the fold');
} catch (error) {
  console.error('Error analyzing bundle:', error.message);
  process.exit(1);
}
