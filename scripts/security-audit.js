#!/usr/bin/env node

/**
 * Security Audit Script for Global Travel Report
 *
 * This script performs a security audit of the codebase, checking for:
 * - Exposed API keys and secrets
 * - Insecure dependencies
 * - Missing security headers
 * - Insecure configurations
 * - Potential XSS vulnerabilities
 * - CSRF protection
 * - Content Security Policy
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const config = {
  // Directories to exclude from scanning
  excludeDirs: ['node_modules', '.next', '.git', 'public', 'dist', 'build'],

  // File extensions to scan
  includeExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.env', '.env.local', '.env.development', '.env.production'],

  // Patterns to check for potential secrets
  secretPatterns: [
    { pattern: /(['"])(?:api|access|secret|private|key|token|password|auth)_?(?:key|token|secret|password|id)['"]?\s*(?::|=>|=)\s*['"]([a-zA-Z0-9_\-]{16,})['"]/, name: 'API Key/Secret' },
    { pattern: /(['"])[a-zA-Z0-9_\-]{20,}(['"])/, name: 'Potential Secret' },
    { pattern: /(['"])sk-[a-zA-Z0-9]{20,}(['"])/, name: 'OpenAI API Key' },
    { pattern: /(['"])ghp_[a-zA-Z0-9]{20,}(['"])/, name: 'GitHub Token' },
    { pattern: /(['"])SG\.[a-zA-Z0-9_\-]{20,}(['"])/, name: 'SendGrid API Key' },
    { pattern: /(['"])AKIA[0-9A-Z]{16}(['"])/, name: 'AWS Access Key' },
  ],

  // Security headers to check for
  securityHeaders: [
    'Content-Security-Policy',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Referrer-Policy',
    'Permissions-Policy',
  ],
};

// Results storage
const results = {
  potentialSecrets: [],
  missingSecurityHeaders: [],
  insecureDependencies: [],
  csrfIssues: [],
  xssVulnerabilities: [],
  insecureConfigs: [],
};

/**
 * Check if a file should be scanned
 * @param {string} filePath - Path to the file
 * @returns {boolean} Whether the file should be scanned
 */
function shouldScanFile(filePath) {
  // Check if file is in excluded directory
  if (config.excludeDirs.some(dir => filePath.includes(`/${dir}/`))) {
    return false;
  }

  // Check file extension
  const ext = path.extname(filePath);
  return config.includeExtensions.includes(ext);
}

/**
 * Scan a file for potential secrets
 * @param {string} filePath - Path to the file
 */
function scanFileForSecrets(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      config.secretPatterns.forEach(({ pattern, name }) => {
        const match = line.match(pattern);
        if (match) {
          results.potentialSecrets.push({
            file: filePath,
            line: index + 1,
            content: line.trim(),
            type: name,
          });
        }
      });
    });
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
}

/**
 * Scan all files in a directory recursively
 * @param {string} dir - Directory to scan
 */
function scanDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        // Skip excluded directories
        if (!config.excludeDirs.includes(file)) {
          scanDirectory(filePath);
        }
      } else if (shouldScanFile(filePath)) {
        scanFileForSecrets(filePath);
      }
    });
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
}

/**
 * Check for insecure dependencies using npm audit
 */
function checkDependencies() {
  try {
    console.log(chalk.blue('Checking for insecure dependencies...'));

    const output = execSync('npm audit --json', { encoding: 'utf8' });
    const auditResult = JSON.parse(output);

    if (auditResult.vulnerabilities) {
      const vulnerabilities = Object.values(auditResult.vulnerabilities);

      vulnerabilities.forEach(vuln => {
        results.insecureDependencies.push({
          name: vuln.name,
          severity: vuln.severity,
          via: vuln.via,
          effects: vuln.effects,
          range: vuln.range,
          nodes: vuln.nodes,
          fixAvailable: vuln.fixAvailable,
        });
      });
    }
  } catch (error) {
    try {
      // If npm audit fails but returns JSON, parse it
      const output = error.stdout;
      if (output) {
        const auditResult = JSON.parse(output);

        if (auditResult.vulnerabilities) {
          const vulnerabilities = Object.values(auditResult.vulnerabilities);

          vulnerabilities.forEach(vuln => {
            results.insecureDependencies.push({
              name: vuln.name,
              severity: vuln.severity,
              via: vuln.via,
              effects: vuln.effects,
              range: vuln.range,
              nodes: vuln.nodes,
              fixAvailable: vuln.fixAvailable,
            });
          });
        }
      } else {
        console.error('Error checking dependencies:', error.message);
      }
    } catch (parseError) {
      console.error('Error parsing npm audit output:', parseError.message);
    }
  }
}

/**
 * Check for security headers in middleware.ts
 */
function checkSecurityHeaders() {
  try {
    console.log(chalk.blue('Checking for security headers...'));

    const middlewarePaths = [
      'src/middleware.ts',
      'middleware.ts',
      'app/middleware.ts',
    ];

    let middlewareContent = '';

    for (const middlewarePath of middlewarePaths) {
      if (fs.existsSync(middlewarePath)) {
        middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
        break;
      }
    }

    if (!middlewareContent) {
      results.missingSecurityHeaders.push({
        issue: 'Middleware file not found',
        recommendation: 'Create a middleware.ts file to add security headers',
      });
      return;
    }

    // Check for each security header
    config.securityHeaders.forEach(header => {
      // Special case for Content-Security-Policy
      if (header === 'Content-Security-Policy' &&
          (middlewareContent.includes('applyCSP') ||
           middlewareContent.includes('Content-Security-Policy'))) {
        return; // CSP is implemented
      }

      if (!middlewareContent.includes(header)) {
        results.missingSecurityHeaders.push({
          header,
          issue: `Missing security header: ${header}`,
          recommendation: `Add ${header} to middleware.ts`,
        });
      }
    });
  } catch (error) {
    console.error('Error checking security headers:', error.message);
  }
}

/**
 * Check for CSRF protection
 */
function checkCsrfProtection() {
  try {
    console.log(chalk.blue('Checking for CSRF protection...'));

    const middlewarePaths = [
      'src/middleware.ts',
      'middleware.ts',
      'app/middleware.ts',
    ];

    let middlewareContent = '';

    for (const middlewarePath of middlewarePaths) {
      if (fs.existsSync(middlewarePath)) {
        middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
        break;
      }
    }

    if (!middlewareContent) {
      results.csrfIssues.push({
        issue: 'Middleware file not found',
        recommendation: 'Create a middleware.ts file to add CSRF protection',
      });
      return;
    }

    // Check for CSRF protection
    if (!middlewareContent.includes('csrf') && !middlewareContent.includes('CSRF')) {
      results.csrfIssues.push({
        issue: 'No CSRF protection found in middleware',
        recommendation: 'Add CSRF protection to middleware.ts',
      });
    }

    // Check API routes for CSRF validation
    const apiDir = 'app/api';
    if (fs.existsSync(apiDir)) {
      const apiFiles = execSync(`find ${apiDir} -type f -name "route.ts" -o -name "route.js"`, { encoding: 'utf8' }).split('\n').filter(Boolean);

      apiFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');

        // Check if it's a POST, PUT, or DELETE route
        if (content.includes('POST') || content.includes('PUT') || content.includes('DELETE')) {
          // Check if it validates CSRF token
          if (!content.includes('csrf') && !content.includes('CSRF')) {
            results.csrfIssues.push({
              file,
              issue: 'API route does not validate CSRF token',
              recommendation: 'Add CSRF token validation to the API route',
            });
          }
        }
      });
    }
  } catch (error) {
    console.error('Error checking CSRF protection:', error.message);
  }
}

/**
 * Check for potential XSS vulnerabilities
 */
function checkXssVulnerabilities() {
  try {
    console.log(chalk.blue('Checking for potential XSS vulnerabilities...'));

    // Check for dangerouslySetInnerHTML
    const jsxFiles = execSync(`find . -type f -name "*.tsx" -o -name "*.jsx" | grep -v "node_modules" | grep -v ".next"`, { encoding: 'utf8' }).split('\n').filter(Boolean);

    jsxFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');

      // Check for dangerouslySetInnerHTML without sanitization
      if (content.includes('dangerouslySetInnerHTML') && !content.includes('sanitize') && !content.includes('DOMPurify')) {
        results.xssVulnerabilities.push({
          file,
          issue: 'Using dangerouslySetInnerHTML without sanitization',
          recommendation: 'Use DOMPurify or another sanitization library',
        });
      }

      // Check for direct DOM manipulation
      if (content.includes('document.write') || content.includes('innerHTML =')) {
        results.xssVulnerabilities.push({
          file,
          issue: 'Direct DOM manipulation found',
          recommendation: 'Avoid direct DOM manipulation, use React state instead',
        });
      }
    });
  } catch (error) {
    console.error('Error checking XSS vulnerabilities:', error.message);
  }
}

/**
 * Check for insecure configurations
 */
function checkInsecureConfigs() {
  try {
    console.log(chalk.blue('Checking for insecure configurations...'));

    // Check next.config.js
    if (fs.existsSync('next.config.js')) {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');

      // Check for insecure headers
      if (nextConfig.includes('X-Powered-By') && !nextConfig.includes('X-Powered-By: false')) {
        results.insecureConfigs.push({
          file: 'next.config.js',
          issue: 'X-Powered-By header not disabled',
          recommendation: 'Disable X-Powered-By header in next.config.js',
        });
      }
    }

    // Check for .env files in git
    try {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');

      if (!gitignore.includes('.env') && !gitignore.includes('*.env')) {
        results.insecureConfigs.push({
          file: '.gitignore',
          issue: '.env files not ignored in git',
          recommendation: 'Add .env* to .gitignore',
        });
      }
    } catch (error) {
      results.insecureConfigs.push({
        file: '.gitignore',
        issue: '.gitignore file not found',
        recommendation: 'Create a .gitignore file and add .env* to it',
      });
    }
  } catch (error) {
    console.error('Error checking insecure configurations:', error.message);
  }
}

/**
 * Print the results of the security audit
 */
function printResults() {
  console.log('\n' + chalk.yellow('=== SECURITY AUDIT RESULTS ==='));

  // Print potential secrets
  if (results.potentialSecrets.length > 0) {
    console.log('\n' + chalk.red('POTENTIAL SECRETS FOUND:'));
    results.potentialSecrets.forEach(({ file, line, content, type }) => {
      console.log(chalk.red(`  [${type}] ${file}:${line}`));
      console.log(`    ${content}`);
    });
  } else {
    console.log('\n' + chalk.green('✓ No potential secrets found'));
  }

  // Print missing security headers
  if (results.missingSecurityHeaders.length > 0) {
    console.log('\n' + chalk.red('MISSING SECURITY HEADERS:'));
    results.missingSecurityHeaders.forEach(({ header, issue, recommendation }) => {
      console.log(chalk.red(`  ${issue}`));
      console.log(`    Recommendation: ${recommendation}`);
    });
  } else {
    console.log('\n' + chalk.green('✓ All security headers are present'));
  }

  // Print insecure dependencies
  if (results.insecureDependencies.length > 0) {
    console.log('\n' + chalk.red('INSECURE DEPENDENCIES:'));
    results.insecureDependencies.forEach(({ name, severity, fixAvailable }) => {
      console.log(chalk.red(`  ${name} (${severity})`));
      console.log(`    Fix available: ${fixAvailable ? 'Yes' : 'No'}`);
    });
  } else {
    console.log('\n' + chalk.green('✓ No insecure dependencies found'));
  }

  // Print CSRF issues
  if (results.csrfIssues.length > 0) {
    console.log('\n' + chalk.red('CSRF ISSUES:'));
    results.csrfIssues.forEach(({ file, issue, recommendation }) => {
      console.log(chalk.red(`  ${issue}${file ? ` in ${file}` : ''}`));
      console.log(`    Recommendation: ${recommendation}`);
    });
  } else {
    console.log('\n' + chalk.green('✓ CSRF protection is in place'));
  }

  // Print XSS vulnerabilities
  if (results.xssVulnerabilities.length > 0) {
    console.log('\n' + chalk.red('POTENTIAL XSS VULNERABILITIES:'));
    results.xssVulnerabilities.forEach(({ file, issue, recommendation }) => {
      console.log(chalk.red(`  ${issue} in ${file}`));
      console.log(`    Recommendation: ${recommendation}`);
    });
  } else {
    console.log('\n' + chalk.green('✓ No potential XSS vulnerabilities found'));
  }

  // Print insecure configurations
  if (results.insecureConfigs.length > 0) {
    console.log('\n' + chalk.red('INSECURE CONFIGURATIONS:'));
    results.insecureConfigs.forEach(({ file, issue, recommendation }) => {
      console.log(chalk.red(`  ${issue} in ${file}`));
      console.log(`    Recommendation: ${recommendation}`);
    });
  } else {
    console.log('\n' + chalk.green('✓ No insecure configurations found'));
  }

  // Print summary
  const totalIssues =
    results.potentialSecrets.length +
    results.missingSecurityHeaders.length +
    results.insecureDependencies.length +
    results.csrfIssues.length +
    results.xssVulnerabilities.length +
    results.insecureConfigs.length;

  console.log('\n' + chalk.yellow('=== SUMMARY ==='));
  console.log(chalk.yellow(`Total issues found: ${totalIssues}`));

  if (totalIssues > 0) {
    console.log(chalk.yellow('Please address these issues to improve the security of your application.'));
  } else {
    console.log(chalk.green('No security issues found. Great job!'));
  }
}

/**
 * Main function
 */
function main() {
  console.log(chalk.yellow('=== GLOBAL TRAVEL REPORT SECURITY AUDIT ==='));
  console.log(chalk.blue('Scanning for potential secrets...'));

  // Scan the codebase for potential secrets
  scanDirectory('.');

  // Check for insecure dependencies
  checkDependencies();

  // Check for security headers
  checkSecurityHeaders();

  // Check for CSRF protection
  checkCsrfProtection();

  // Check for XSS vulnerabilities
  checkXssVulnerabilities();

  // Check for insecure configurations
  checkInsecureConfigs();

  // Print the results
  printResults();
}

// Run the main function
main();
