#!/usr/bin/env node
/**
 * Fix HTTP URLs Script
 * 
 * This script scans the codebase for non-HTTPS URLs and converts them to HTTPS.
 * It's part of the security enhancement process.
 * 
 * Usage:
 *   node scripts/fix-http-urls.js
 * 
 * Options:
 *   --dry-run: Show what would be changed without making changes
 *   --verbose: Show more detailed output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const config = {
  // Directories to scan
  directories: [
    'src',
    'app',
    'components',
    'middleware',
    'pages',
    'public',
  ],
  // File extensions to check
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.md'],
  // Patterns to look for
  patterns: [
    {
      // Match http:// URLs that aren't localhost or 127.0.0.1
      regex: /http:\/\/(?!localhost|127\.0\.0\.1)([^'")\s]+)/g,
      replacement: 'https://$1',
    },
  ],
  // Files to ignore
  ignoreFiles: [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    'coverage',
  ],
};

// Helper functions
function log(message, type = 'info') {
  const prefix = {
    info: chalk.blue('ℹ'),
    success: chalk.green('✓'),
    warning: chalk.yellow('⚠'),
    error: chalk.red('✗'),
  };
  
  console.log(`${prefix[type]} ${message}`);
}

function getAllFiles(dir, extensions) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Skip ignored files and directories
    if (config.ignoreFiles.some(ignore => filePath.includes(ignore))) {
      return;
    }
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, extensions));
    } else {
      const ext = path.extname(filePath).toLowerCase();
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

function fixHttpUrls(filePath, dryRun = false, verbose = false) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changed = false;
    
    config.patterns.forEach(pattern => {
      const matches = content.match(pattern.regex);
      
      if (matches) {
        if (verbose) {
          log(`Found ${matches.length} HTTP URLs in ${filePath}`, 'warning');
          matches.forEach(match => {
            log(`  ${match}`, 'warning');
          });
        }
        
        content = content.replace(pattern.regex, pattern.replacement);
        changed = true;
      }
    });
    
    if (changed) {
      if (dryRun) {
        log(`Would fix HTTP URLs in ${filePath}`, 'warning');
      } else {
        fs.writeFileSync(filePath, content, 'utf8');
        log(`Fixed HTTP URLs in ${filePath}`, 'success');
      }
      return true;
    }
    
    return false;
  } catch (error) {
    log(`Error processing ${filePath}: ${error.message}`, 'error');
    return false;
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');
  
  log(`Starting HTTP URL fix ${dryRun ? '(dry run)' : ''}...`, 'info');
  
  let totalFiles = 0;
  let fixedFiles = 0;
  
  config.directories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      log(`Directory ${dirPath} does not exist, skipping`, 'warning');
      return;
    }
    
    const files = getAllFiles(dirPath, config.extensions);
    totalFiles += files.length;
    
    files.forEach(file => {
      if (fixHttpUrls(file, dryRun, verbose)) {
        fixedFiles++;
      }
    });
  });
  
  log(`\nSummary:`, 'info');
  log(`Scanned ${totalFiles} files`, 'info');
  log(`Fixed HTTP URLs in ${fixedFiles} files`, fixedFiles > 0 ? 'success' : 'info');
  
  if (dryRun && fixedFiles > 0) {
    log(`\nRun without --dry-run to apply changes`, 'warning');
  }
}

// Run the script
main();
