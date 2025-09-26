#!/usr/bin/env node

/**
 * Performance Optimization Runner
 * 
 * This script runs all performance optimization scripts in sequence:
 * 1. Image optimization
 * 2. JavaScript optimization
 * 3. Core Web Vitals optimization
 * 4. Caching strategy setup
 * 
 * Usage:
 * node scripts/run-performance-optimization.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  scripts: [
    {
      name: 'Image Optimization',
      path: './scripts/setup-image-optimization.js',
      required: true
    },
    {
      name: 'Image Analysis',
      path: './scripts/analyze-image-usage.js',
      required: false
    },
    {
      name: 'JavaScript Bundle Analysis',
      path: './scripts/analyze-bundles.js',
      required: false
    },
    {
      name: 'Core Web Vitals Optimization',
      path: './scripts/optimize-web-vitals.js',
      required: true
    },
    {
      name: 'Caching Strategy Setup',
      path: './scripts/setup-caching.js',
      required: true
    }
  ],
  reportPath: './performance-optimization-report.md'
};

// Run a single script
function runScript(script) {
  console.log(`\n=== Running ${script.name} ===\n`);
  
  try {
    if (fs.existsSync(script.path)) {
      execSync(`node ${script.path}`, { stdio: 'inherit' });
      return true;
    } else {
      console.error(`Script not found: ${script.path}`);
      return false;
    }
  } catch (error) {
    console.error(`Error running ${script.name}:`, error.message);
    return false;
  }
}

// Generate a summary report
function generateReport(results) {
  let markdown = `# Performance Optimization Summary\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // Results table
  markdown += `## Results\n\n`;
  markdown += `| Optimization | Status | Notes |\n`;
  markdown += `|--------------|--------|-------|\n`;
  
  results.forEach(result => {
    const status = result.success ? '✅ Success' : result.required ? '❌ Failed' : '⚠️ Skipped';
    markdown += `| ${result.name} | ${status} | ${result.notes || ''} |\n`;
  });
  
  // Next steps
  markdown += `\n## Next Steps\n\n`;
  markdown += `1. Review individual reports for each optimization\n`;
  markdown += `2. Run Lighthouse audit to measure improvements\n`;
  markdown += `3. Address any failed optimizations\n`;
  markdown += `4. Implement additional optimizations as needed\n\n`;
  
  // Individual reports
  markdown += `## Individual Reports\n\n`;
  markdown += `- [Image Analysis Report](./image-analysis-report.md)\n`;
  markdown += `- [Bundle Analysis Report](./bundle-analysis-report.md)\n`;
  markdown += `- [Web Vitals Report](./web-vitals-report.md)\n`;
  markdown += `- [Caching Strategy Documentation](./docs/CACHING_STRATEGY.md)\n`;
  
  return markdown;
}

// Main function
async function main() {
  console.log('Starting performance optimization...');
  
  const results = [];
  
  // Run each script
  for (const script of config.scripts) {
    const success = runScript(script);
    
    results.push({
      name: script.name,
      success,
      required: script.required,
      notes: success 
        ? 'Completed successfully' 
        : script.required 
          ? 'Required optimization failed' 
          : 'Optional optimization skipped'
    });
    
    // If a required script fails, stop the process
    if (!success && script.required) {
      console.error(`Required optimization "${script.name}" failed. Stopping process.`);
      break;
    }
  }
  
  // Generate report
  const reportContent = generateReport(results);
  fs.writeFileSync(config.reportPath, reportContent);
  
  console.log(`\nPerformance optimization complete! Summary report saved to ${config.reportPath}`);
  
  // Final message
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success && r.required).length;
  const skippedCount = results.filter(r => !r.success && !r.required).length;
  
  console.log(`\nSummary: ${successCount} successful, ${failedCount} failed, ${skippedCount} skipped`);
  
  if (failedCount > 0) {
    console.log('\nSome required optimizations failed. Please review the logs and try again.');
    process.exit(1);
  } else {
    console.log('\nAll required optimizations completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run a Lighthouse audit to measure improvements');
    console.log('2. Review the individual reports for each optimization');
    console.log('3. Implement any additional optimizations as needed');
  }
}

// Run the optimization
main().catch(error => {
  console.error('Error running performance optimization:', error);
  process.exit(1);
});
