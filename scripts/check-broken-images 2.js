#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Function to check if URL is accessible
function checkUrl(url) {
  return new Promise((resolve) => {
    const request = https.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        isValid: res.statusCode >= 200 && res.statusCode < 400
      });
    });

    request.on('error', () => {
      resolve({
        url,
        status: 0,
        isValid: false
      });
    });

    request.setTimeout(10000, () => {
      request.destroy();
      resolve({
        url,
        status: 0,
        isValid: false
      });
    });

    request.end();
  });
}

// Function to extract Unsplash URLs from files
function extractUnsplashUrls(content) {
  const unsplashRegex = /https:\/\/images\.unsplash\.com\/[^"'\s)]+/g;
  const urls = [];
  let match;

  while ((match = unsplashRegex.exec(content)) !== null) {
    urls.push(match[0]);
  }

  return [...new Set(urls)]; // Remove duplicates
}

// Function to scan files for Unsplash URLs
async function scanFiles() {
  const results = {
    totalFiles: 0,
    filesWithUnsplash: 0,
    totalUrls: 0,
    brokenUrls: [],
    validUrls: []
  };

  async function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== '.git') {
        await scanDirectory(filePath);
      } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.json'))) {
        results.totalFiles++;

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const urls = extractUnsplashUrls(content);

          if (urls.length > 0) {
            results.filesWithUnsplash++;
            results.totalUrls += urls.length;

            console.log(`Found ${urls.length} Unsplash URLs in ${filePath}:`);
            urls.forEach(url => console.log(`  - ${url}`));

            // Check each URL
            for (const url of urls) {
              console.log(`Checking ${url}...`);
              const result = await checkUrl(url);

              if (result.isValid) {
                results.validUrls.push(result);
                console.log(`  ✓ ${result.status}`);
              } else {
                results.brokenUrls.push(result);
                console.log(`  ✗ ${result.status || 'Connection failed'}`);
              }
            }
          }
        } catch (error) {
          console.error(`Error reading ${filePath}:`, error.message);
        }
      }
    }
  }

  console.log('Scanning for Unsplash URLs...\n');
  await scanDirectory('.');

  return results;
}

// Main execution
async function main() {
  try {
    const results = await scanFiles();

    console.log('\n=== SCAN RESULTS ===');
    console.log(`Total files scanned: ${results.totalFiles}`);
    console.log(`Files with Unsplash URLs: ${results.filesWithUnsplash}`);
    console.log(`Total Unsplash URLs found: ${results.totalUrls}`);
    console.log(`Valid URLs: ${results.validUrls.length}`);
    console.log(`Broken URLs: ${results.brokenUrls.length}`);

    if (results.brokenUrls.length > 0) {
      console.log('\n=== BROKEN URLS ===');
      results.brokenUrls.forEach(result => {
        console.log(`${result.url} - Status: ${result.status || 'Connection failed'}`);
      });
    }

    // Exit with error code if broken URLs found
    process.exit(results.brokenUrls.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error during scan:', error);
    process.exit(1);
  }
}

main();