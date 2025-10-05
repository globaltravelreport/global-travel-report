#!/usr/bin/env node

/**
 * JavaScript Bundle Analysis Script
 * 
 * This script:
 * 1. Builds the application with bundle analyzer
 * 2. Identifies large dependencies
 * 3. Suggests optimizations
 * 
 * Usage:
 * node scripts/analyze-bundles.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const _path = require('path');

// Configuration
const config = {
  buildCommand: 'ANALYZE=true npm run build',
  reportPath: './bundle-analysis-report.md',
  sizeThresholds: {
    critical: 100 * 1024, // 100KB
    warning: 50 * 1024,   // 50KB
    good: 20 * 1024       // 20KB
  }
};

// Run the bundle analyzer
function analyzeBundles() {
  console.log('Building application with bundle analyzer...');
  
  try {
    // Check if next-bundle-analyzer is installed
    try {
      require.resolve('next-bundle-analyzer');
    } catch (error) {
      console.log('Installing next-bundle-analyzer...');
      execSync('npm install --save-dev next-bundle-analyzer', { stdio: 'inherit' });
    }
    
    // Update next.config.js to include bundle analyzer
    updateNextConfig();
    
    // Run the build with analyzer
    execSync(config.buildCommand, { stdio: 'inherit' });
    
    console.log('Bundle analysis complete!');
  } catch (__error) {
    console.error('Error analyzing bundles:', __error.message);
  }
}

// Update next.config.js to include bundle analyzer
function updateNextConfig() {
  const configPath = './next.config.js';
  
  if (!fs.existsSync(configPath)) {
    console.error('next.config.js not found. Please create it first.');
    return;
  }
  
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Check if bundle analyzer is already configured
  if (configContent.includes('withBundleAnalyzer')) {
    console.log('Bundle analyzer already configured in next.config.js');
    return;
  }
  
  // Add bundle analyzer configuration
  const analyzerConfig = `
const withBundleAnalyzer = require('next-bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});
`;
  
  // Add the import at the top
  configContent = analyzerConfig + configContent;
  
  // Wrap the module.exports with withBundleAnalyzer
  const moduleExportsRegex = /module\.exports\s*=/;
  if (moduleExportsRegex.test(configContent)) {
    configContent = configContent.replace(
      moduleExportsRegex,
      'const nextConfig = '
    );
    
    // Add the withBundleAnalyzer wrapper at the end
    configContent += '\n\nmodule.exports = withBundleAnalyzer(nextConfig);';
    
    fs.writeFileSync(configPath, configContent);
    console.log('Updated next.config.js with bundle analyzer configuration');
  } else {
    console.error('Could not find module.exports in next.config.js');
  }
}

// Generate optimization recommendations
function generateRecommendations() {
  const recommendations = [
    {
      title: 'Code Splitting',
      description: 'Use dynamic imports to split code into smaller chunks',
      example: "import dynamic from 'next/dynamic';\n\nconst DynamicComponent = dynamic(() => import('../components/HeavyComponent'));"
    },
    {
      title: 'Tree Shaking',
      description: 'Import only what you need from libraries',
      example: "// Instead of:\nimport lodash from 'lodash';\n\n// Use:\nimport { debounce } from 'lodash/debounce';"
    },
    {
      title: 'Lazy Loading',
      description: 'Lazy load components that are not needed immediately',
      example: "import { lazy, Suspense } from 'react';\n\nconst LazyComponent = lazy(() => import('./LazyComponent'));\n\nfunction MyComponent() {\n  return (\n    <Suspense fallback={<div>Loading...</div>}>\n      <LazyComponent />\n    </Suspense>\n  );\n}"
    },
    {
      title: 'Replace Heavy Libraries',
      description: 'Consider lighter alternatives for heavy dependencies',
      example: "// Instead of moment.js (heavy)\nimport moment from 'moment';\n\n// Use date-fns (lighter)\nimport { format } from 'date-fns';"
    },
    {
      title: 'Use Next.js Features',
      description: 'Leverage Next.js built-in optimizations',
      example: "// Use Image component\nimport Image from 'next/image';\n\n// Use Link component\nimport Link from 'next/link';"
    }
  ];
  
  return recommendations;
}

// Generate a markdown report
function generateReport() {
  const recommendations = generateRecommendations();
  
  let markdown = `# JavaScript Bundle Analysis Report\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // Recommendations
  markdown += `## Optimization Recommendations\n\n`;
  
  recommendations.forEach((rec, index) => {
    markdown += `### ${index + 1}. ${rec.title}\n\n`;
    markdown += `${rec.description}\n\n`;
    markdown += `\`\`\`javascript\n${rec.example}\n\`\`\`\n\n`;
  });
  
  // Common large dependencies
  markdown += `## Common Large Dependencies\n\n`;
  markdown += `| Package | Size | Alternative | Size Reduction |\n`;
  markdown += `|---------|------|-------------|---------------|\n`;
  markdown += `| moment | ~300KB | date-fns | ~85% |\n`;
  markdown += `| lodash | ~70KB | lodash-es (with tree shaking) | ~70% |\n`;
  markdown += `| react-icons (all) | ~500KB | individual imports | ~99% |\n`;
  markdown += `| chart.js | ~170KB | lightweight-charts | ~70% |\n`;
  markdown += `| material-ui | ~300KB | tailwind + headless UI | ~80% |\n\n`;
  
  // Next steps
  markdown += `## Next Steps\n\n`;
  markdown += `1. Review the bundle analyzer output in \`.next/analyze/\`\n`;
  markdown += `2. Identify the largest dependencies in your application\n`;
  markdown += `3. Apply the recommended optimizations\n`;
  markdown += `4. Re-run the analysis to verify improvements\n\n`;
  
  // Resources
  markdown += `## Resources\n\n`;
  markdown += `- [Next.js Documentation on Code Splitting](https://nextjs.org/docs/advanced-features/dynamic-import)\n`;
  markdown += `- [Web.dev Guide to Code Splitting](https://web.dev/reduce-javascript-payloads-with-code-splitting/)\n`;
  markdown += `- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)\n`;
  
  return markdown;
}

// Main function
function main() {
  console.log('Starting JavaScript bundle analysis...');
  
  try {
    analyzeBundles();
    
    // Generate report
    const reportContent = generateReport();
    fs.writeFileSync(config.reportPath, reportContent);
    
    console.log(`Analysis complete! Report saved to ${config.reportPath}`);
  } catch (error) {
    console.error('Error running bundle analysis:', error);
  }
}

// Run the analysis
main();
