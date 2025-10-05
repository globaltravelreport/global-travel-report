#!/usr/bin/env node
/**
 * Security Audit Script
 * 
 * This script performs a security audit of the Global Travel Report website.
 * It checks for common security issues and provides recommendations for fixing them.
 * 
 * Usage:
 *   node scripts/security-audit.js
 * 
 * Options:
 *   --fix: Attempt to fix some issues automatically
 *   --report: Generate a detailed report
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
  // Files to check
  configFiles: [
    'next.config.js',
    'middleware.ts',
    'middleware/performanceHeaders.ts',
    'src/middleware/csp.ts',
    'src/middleware/csrf.ts',
  ],
  // Security headers to check for
  securityHeaders: [
    'Content-Security-Policy',
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Referrer-Policy',
    'Permissions-Policy',
  ],
  // Patterns to look for in code
  patterns: {
    // Insecure patterns
    insecure: [
      { pattern: /eval\s*\(/g, description: 'Use of eval() function' },
      { pattern: /document\.write\s*\(/g, description: 'Use of document.write()' },
      { pattern: /innerHTML\s*=/g, description: 'Use of innerHTML (consider textContent)' },
      { pattern: /http:\/\//g, description: 'Non-HTTPS URL' },
      { pattern: /dangerouslySetInnerHTML/g, description: 'Use of dangerouslySetInnerHTML' },
      { pattern: /password.*=.*['"][^'"]*['"]|apiKey.*=.*['"][^'"]*['"]|secret.*=.*['"][^'"]*['"]/g, description: 'Hardcoded credentials' },
    ],
    // Patterns that should be present
    secure: [
      { pattern: /upgrade-insecure-requests/g, description: 'CSP upgrade-insecure-requests directive', file: 'src/middleware/csp.ts' },
      { pattern: /Strict-Transport-Security/g, description: 'HSTS header', file: 'middleware.ts' },
      { pattern: /X-Content-Type-Options/g, description: 'X-Content-Type-Options header', file: 'middleware/performanceHeaders.ts' },
    ],
  },
};

// Results storage
const results = {
  issues: [],
  passes: [],
  warnings: [],
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

function addIssue(description, file = null, line = null, severity = 'high', fixable = false) {
  results.issues.push({
    description,
    file,
    line,
    severity,
    fixable,
  });
}

function addPass(description) {
  results.passes.push({ description });
}

function addWarning(description, file = null) {
  results.warnings.push({
    description,
    file,
  });
}

// Check functions
function checkSecurityHeaders() {
  log('Checking security headers...');
  
  // Check middleware.ts for security headers
  const middlewarePath = path.join(process.cwd(), 'middleware.ts');
  if (fs.existsSync(middlewarePath)) {
    const content = fs.readFileSync(middlewarePath, 'utf8');
    
    config.securityHeaders.forEach(header => {
      if (content.includes(header)) {
        addPass(`${header} header is set in middleware.ts`);
      } else {
        addWarning(`${header} header might not be set`, 'middleware.ts');
      }
    });
  } else {
    addIssue('middleware.ts file not found', null, null, 'high', false);
  }
}

function checkHttpsEnforcement() {
  log('Checking HTTPS enforcement...');
  
  // Check for upgrade-insecure-requests in CSP
  const cspPath = path.join(process.cwd(), 'src/middleware/csp.ts');
  if (fs.existsSync(cspPath)) {
    const content = fs.readFileSync(cspPath, 'utf8');
    
    if (content.includes('upgrade-insecure-requests')) {
      addPass('CSP includes upgrade-insecure-requests directive');
    } else {
      addIssue('CSP does not include upgrade-insecure-requests directive', 'src/middleware/csp.ts', null, 'high', true);
    }
  }
  
  // Check for HSTS header
  const middlewarePath = path.join(process.cwd(), 'middleware.ts');
  if (fs.existsSync(middlewarePath)) {
    const content = fs.readFileSync(middlewarePath, 'utf8');
    
    if (content.includes('Strict-Transport-Security')) {
      addPass('HSTS header is set');
    } else {
      addIssue('HSTS header is not set', 'middleware.ts', null, 'high', true);
    }
  }
}

function scanCodeForPatterns() {
  log('Scanning code for security patterns...');
  
  config.directories.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      return;
    }
    
    // Get all files recursively
    const files = getAllFiles(dirPath);
    
    files.forEach(file => {
      // Skip node_modules and .next
      if (file.includes('node_modules') || file.includes('.next')) {
        return;
      }
      
      // Skip non-code files
      if (!['.js', '.jsx', '.ts', '.tsx', '.html', '.css'].some(ext => file.endsWith(ext))) {
        return;
      }
      
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(process.cwd(), file);
      
      // Check for insecure patterns
      config.patterns.insecure.forEach(({ pattern, description }) => {
        const matches = content.match(pattern);
        if (matches) {
          // Find line numbers
          const lines = content.split('\n');
          const lineNumbers = [];
          
          lines.forEach((line, index) => {
            if (pattern.test(line)) {
              lineNumbers.push(index + 1);
            }
          });
          
          addIssue(`${description} found`, relativePath, lineNumbers.join(', '), 'medium', false);
        }
      });
    });
  });
  
  // Check for secure patterns that should be present
  config.patterns.secure.forEach(({ pattern, description, file }) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (pattern.test(content)) {
        addPass(description);
      } else {
        addIssue(`Missing ${description}`, file, null, 'high', true);
      }
    }
  });
}

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath));
    } else {
      results.push(filePath);
    }
  });
  
  return results;
}

function checkDependencies() {
  log('Checking dependencies for vulnerabilities...');
  
  try {
    // Run npm audit
    const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(auditOutput);
    
    if (auditData.vulnerabilities) {
      const vulnCount = Object.keys(auditData.vulnerabilities).length;
      
      if (vulnCount > 0) {
        addIssue(`${vulnCount} vulnerable dependencies found. Run 'npm audit' for details.`, 'package.json', null, 'high', true);
      } else {
        addPass('No vulnerable dependencies found');
      }
    }
  } catch (error) {
    // If npm audit finds vulnerabilities, it exits with a non-zero code
    try {
      const errorOutput = error.stdout;
      const auditData = JSON.parse(errorOutput);
      
      if (auditData.vulnerabilities) {
        const vulnCount = Object.keys(auditData.vulnerabilities).length;
        addIssue(`${vulnCount} vulnerable dependencies found. Run 'npm audit' for details.`, 'package.json', null, 'high', true);
      }
    } catch (__error) {
      addWarning('Failed to check dependencies for vulnerabilities');
    }
  }
}

function generateReport() {
  log('Generating security audit report...');
  
  const reportPath = path.join(process.cwd(), 'security-audit-report.md');
  
  let report = `# Security Audit Report\n\n`;
  report += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // Summary
  report += `## Summary\n\n`;
  report += `- Issues: ${results.issues.length}\n`;
  report += `- Warnings: ${results.warnings.length}\n`;
  report += `- Passes: ${results.passes.length}\n\n`;
  
  // Issues
  if (results.issues.length > 0) {
    report += `## Issues\n\n`;
    
    // Group by severity
    const highIssues = results.issues.filter(issue => issue.severity === 'high');
    const mediumIssues = results.issues.filter(issue => issue.severity === 'medium');
    const lowIssues = results.issues.filter(issue => issue.severity === 'low');
    
    if (highIssues.length > 0) {
      report += `### High Severity\n\n`;
      highIssues.forEach(issue => {
        report += `- ${issue.description}`;
        if (issue.file) {
          report += ` (${issue.file}`;
          if (issue.line) {
            report += `, line ${issue.line}`;
          }
          report += `)`;
        }
        report += `\n`;
      });
      report += `\n`;
    }
    
    if (mediumIssues.length > 0) {
      report += `### Medium Severity\n\n`;
      mediumIssues.forEach(issue => {
        report += `- ${issue.description}`;
        if (issue.file) {
          report += ` (${issue.file}`;
          if (issue.line) {
            report += `, line ${issue.line}`;
          }
          report += `)`;
        }
        report += `\n`;
      });
      report += `\n`;
    }
    
    if (lowIssues.length > 0) {
      report += `### Low Severity\n\n`;
      lowIssues.forEach(issue => {
        report += `- ${issue.description}`;
        if (issue.file) {
          report += ` (${issue.file}`;
          if (issue.line) {
            report += `, line ${issue.line}`;
          }
          report += `)`;
        }
        report += `\n`;
      });
      report += `\n`;
    }
  }
  
  // Warnings
  if (results.warnings.length > 0) {
    report += `## Warnings\n\n`;
    results.warnings.forEach(warning => {
      report += `- ${warning.description}`;
      if (warning.file) {
        report += ` (${warning.file})`;
      }
      report += `\n`;
    });
    report += `\n`;
  }
  
  // Passes
  if (results.passes.length > 0) {
    report += `## Passes\n\n`;
    results.passes.forEach(pass => {
      report += `- ${pass.description}\n`;
    });
    report += `\n`;
  }
  
  // Recommendations
  report += `## Recommendations\n\n`;
  report += `1. Fix all high severity issues immediately\n`;
  report += `2. Schedule fixes for medium severity issues\n`;
  report += `3. Review low severity issues and warnings\n`;
  report += `4. Run security audits regularly (at least monthly)\n`;
  report += `5. Keep dependencies updated\n`;
  
  fs.writeFileSync(reportPath, report);
  log(`Report saved to ${reportPath}`, 'success');
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const shouldReport = args.includes('--report');
  const verbose = args.includes('--verbose');
  
  log('Starting security audit...', 'info');
  
  // Run checks
  checkSecurityHeaders();
  checkHttpsEnforcement();
  scanCodeForPatterns();
  checkDependencies();
  
  // Generate report if requested
  if (shouldReport) {
    generateReport();
  }
  
  // Print summary
  log('\nSecurity Audit Summary:', 'info');
  log(`${results.issues.length} issues found`, results.issues.length > 0 ? 'error' : 'success');
  log(`${results.warnings.length} warnings found`, results.warnings.length > 0 ? 'warning' : 'success');
  log(`${results.passes.length} checks passed`, 'success');
  
  // Print issues
  if (results.issues.length > 0) {
    log('\nIssues:', 'error');
    results.issues.forEach(issue => {
      let message = `${issue.description}`;
      if (issue.file) {
        message += ` (${issue.file}`;
        if (issue.line) {
          message += `, line ${issue.line}`;
        }
        message += `)`;
      }
      log(message, 'error');
    });
  }
  
  // Print warnings if verbose
  if (verbose && results.warnings.length > 0) {
    log('\nWarnings:', 'warning');
    results.warnings.forEach(warning => {
      let message = `${warning.description}`;
      if (warning.file) {
        message += ` (${warning.file})`;
      }
      log(message, 'warning');
    });
  }
  
  // Print passes if verbose
  if (verbose && results.passes.length > 0) {
    log('\nPasses:', 'success');
    results.passes.forEach(pass => {
      log(pass.description, 'success');
    });
  }
  
  // Exit with appropriate code
  process.exit(results.issues.length > 0 ? 1 : 0);
}

// Run the script
main();
