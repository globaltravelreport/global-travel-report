#!/usr/bin/env node

/**
 * Bundle Analysis Script for Global Travel Report
 * 
 * This script analyzes the JavaScript bundle size and provides recommendations
 * for optimization. It uses the @next/bundle-analyzer package to generate
 * visualizations of the bundle composition.
 * 
 * Usage:
 * 1. Run `node scripts/analyze-bundle.js`
 * 2. Open the generated report in your browser
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
const bundleAnalyzerConfig = `
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: true,
})

module.exports = withBundleAnalyzer(nextConfig)
`;

/**
 * Check if @next/bundle-analyzer is installed
 * @returns {boolean} Whether the package is installed
 */
function isBundleAnalyzerInstalled() {
  try {
    require.resolve('@next/bundle-analyzer');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Install @next/bundle-analyzer if not already installed
 */
function installBundleAnalyzer() {
  console.log(chalk.blue('Installing @next/bundle-analyzer...'));
  
  try {
    execSync('npm install --save-dev @next/bundle-analyzer', { stdio: 'inherit' });
    console.log(chalk.green('✓ @next/bundle-analyzer installed successfully'));
  } catch (error) {
    console.error(chalk.red('Failed to install @next/bundle-analyzer:'), error.message);
    process.exit(1);
  }
}

/**
 * Backup the next.config.js file
 * @returns {string} Backup file path
 */
function backupNextConfig() {
  console.log(chalk.blue('Backing up next.config.js...'));
  
  try {
    const backupPath = `${nextConfigPath}.backup`;
    fs.copyFileSync(nextConfigPath, backupPath);
    console.log(chalk.green(`✓ Backup created at ${backupPath}`));
    return backupPath;
  } catch (error) {
    console.error(chalk.red('Failed to backup next.config.js:'), error.message);
    process.exit(1);
  }
}

/**
 * Modify next.config.js to enable bundle analyzer
 */
function modifyNextConfig() {
  console.log(chalk.blue('Modifying next.config.js to enable bundle analyzer...'));
  
  try {
    const originalConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Check if bundle analyzer is already configured
    if (originalConfig.includes('@next/bundle-analyzer')) {
      console.log(chalk.yellow('Bundle analyzer is already configured in next.config.js'));
      return;
    }
    
    // Add bundle analyzer configuration
    let newConfig;
    
    if (originalConfig.includes('module.exports')) {
      // Replace module.exports with withBundleAnalyzer(...)
      newConfig = originalConfig.replace(
        /module\.exports\s*=\s*(\{[\s\S]*?\}|[^;]*)/,
        'const nextConfig = $1\n\n' + bundleAnalyzerConfig
      );
    } else if (originalConfig.includes('export default')) {
      // Replace export default with withBundleAnalyzer(...)
      newConfig = originalConfig.replace(
        /export default\s*(\{[\s\S]*?\}|[^;]*)/,
        'const nextConfig = $1\n\n' + bundleAnalyzerConfig
      );
    } else {
      // Append bundle analyzer configuration
      newConfig = originalConfig + '\n\n' + bundleAnalyzerConfig;
    }
    
    fs.writeFileSync(nextConfigPath, newConfig);
    console.log(chalk.green('✓ next.config.js modified successfully'));
  } catch (error) {
    console.error(chalk.red('Failed to modify next.config.js:'), error.message);
    process.exit(1);
  }
}

/**
 * Restore the original next.config.js file
 * @param {string} backupPath - Path to the backup file
 */
function restoreNextConfig(backupPath) {
  console.log(chalk.blue('Restoring original next.config.js...'));
  
  try {
    fs.copyFileSync(backupPath, nextConfigPath);
    fs.unlinkSync(backupPath);
    console.log(chalk.green('✓ Original next.config.js restored'));
  } catch (error) {
    console.error(
      chalk.red('Failed to restore next.config.js:'),
      error.message,
      chalk.yellow(`\nManually restore from backup at ${backupPath}`)
    );
  }
}

/**
 * Build the application with bundle analyzer enabled
 */
function buildWithBundleAnalyzer() {
  console.log(chalk.blue('Building application with bundle analyzer...'));
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log(chalk.green('✓ Build completed successfully'));
  } catch (error) {
    console.error(chalk.red('Build failed:'), error.message);
    process.exit(1);
  }
}

/**
 * Analyze the bundle size and provide recommendations
 */
function analyzeBundleSize() {
  console.log(chalk.blue('Analyzing bundle size...'));
  
  try {
    // Get the .next directory size
    const dotNextSize = getDirSize(path.join(process.cwd(), '.next'));
    const dotNextSizeMB = (dotNextSize / (1024 * 1024)).toFixed(2);
    
    console.log(chalk.yellow(`\nTotal .next directory size: ${dotNextSizeMB} MB`));
    
    // Get the package.json dependencies
    const packageJson = require(path.join(process.cwd(), 'package.json'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    
    // Check for large dependencies
    const largeDependencies = [
      'moment',
      'lodash',
      'jquery',
      'chart.js',
      'three',
      'react-bootstrap',
      'material-ui',
      '@material-ui/core',
      '@mui/material',
    ].filter(dep => dependencies.includes(dep));
    
    if (largeDependencies.length > 0) {
      console.log(chalk.yellow('\nPotentially large dependencies found:'));
      largeDependencies.forEach(dep => {
        console.log(`  - ${dep}`);
      });
      
      console.log(chalk.blue('\nRecommendations:'));
      largeDependencies.forEach(dep => {
        switch (dep) {
          case 'moment':
            console.log('  - Replace moment with date-fns or dayjs (smaller alternatives)');
            break;
          case 'lodash':
            console.log('  - Import specific lodash functions instead of the entire library');
            console.log('    Example: import debounce from "lodash/debounce"');
            break;
          case 'jquery':
            console.log('  - Remove jQuery and use native DOM methods or React state management');
            break;
          case 'chart.js':
            console.log('  - Consider using a lighter charting library like recharts or visx');
            break;
          case 'three':
            console.log('  - Lazy load three.js only on pages that need 3D rendering');
            break;
          case 'react-bootstrap':
          case 'material-ui':
          case '@material-ui/core':
          case '@mui/material':
            console.log('  - Consider using a lighter UI library or custom components');
            break;
          default:
            console.log(`  - Evaluate if ${dep} is necessary or can be replaced with a smaller alternative`);
        }
      });
    }
    
    // General recommendations
    console.log(chalk.blue('\nGeneral Optimization Recommendations:'));
    console.log('  1. Use dynamic imports for large components that are not needed on initial load');
    console.log('     Example: const DynamicComponent = dynamic(() => import("./Component"))');
    console.log('  2. Implement code splitting with React.lazy() and Suspense');
    console.log('  3. Use the "next/image" component for optimized images');
    console.log('  4. Enable gzip or Brotli compression on your server');
    console.log('  5. Implement proper tree-shaking by using ES modules and avoiding side effects');
    console.log('  6. Consider using a CDN for static assets');
    console.log('  7. Review and remove unused dependencies and code');
    
    console.log(chalk.green('\n✓ Bundle analysis completed'));
    console.log(chalk.yellow('Open the generated report in your browser to see detailed bundle composition'));
  } catch (error) {
    console.error(chalk.red('Failed to analyze bundle size:'), error.message);
  }
}

/**
 * Get the size of a directory in bytes
 * @param {string} dirPath - Directory path
 * @returns {number} Directory size in bytes
 */
function getDirSize(dirPath) {
  let size = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error getting size of ${dirPath}:`), error.message);
  }
  
  return size;
}

/**
 * Main function
 */
function main() {
  console.log(chalk.yellow('=== BUNDLE ANALYSIS FOR GLOBAL TRAVEL REPORT ==='));
  
  // Check if bundle analyzer is installed
  if (!isBundleAnalyzerInstalled()) {
    installBundleAnalyzer();
  }
  
  // Backup next.config.js
  const backupPath = backupNextConfig();
  
  try {
    // Modify next.config.js
    modifyNextConfig();
    
    // Build with bundle analyzer
    buildWithBundleAnalyzer();
    
    // Analyze bundle size
    analyzeBundleSize();
  } finally {
    // Restore original next.config.js
    restoreNextConfig(backupPath);
  }
}

// Run the main function
main();
