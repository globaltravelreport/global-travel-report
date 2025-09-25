#!/usr/bin/env node

/**
 * Image URL validation script
 * Scans all external image URLs at build time and reports any that are failing
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONCURRENT_REQUESTS = 10;
const REQUEST_TIMEOUT = 10000; // 10 seconds
const ALLOWED_DOMAINS = [
  'images.unsplash.com',
  'unsplash.com',
  'source.unsplash.com',
  'picsum.photos',
  'via.placeholder.com'
];

// Track results
let totalUrls = 0;
let checkedUrls = 0;
let failedUrls = [];
let brokenUrls = [];

// Utility function to check if URL is external
function isExternalUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

// Utility function to check if URL is allowed
function isAllowedDomain(url) {
  try {
    const urlObj = new URL(url);
    return ALLOWED_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

// Function to check if URL is a valid image URL
function isImageUrl(url) {
  // Skip template strings that contain ${} syntax
  if (url.includes('${') || url.includes('photo-${') || url.includes('photo-') && url.includes('${')) {
    return false;
  }

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'];
  const urlPath = new URL(url).pathname.toLowerCase();
  return imageExtensions.some(ext => urlPath.endsWith(ext)) ||
         url.includes('unsplash.com') ||
         url.includes('picsum.photos');
}

// Function to make HTTP request with timeout
function makeRequest(url, timeout = REQUEST_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https://') ? https : http;

    const request = protocol.request(url, {
      method: 'HEAD',
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageChecker/1.0)'
      }
    }, (response) => {
      const contentType = response.headers['content-type'] || '';
      const isImage = contentType.startsWith('image/') ||
                     url.includes('unsplash.com') ||
                     url.includes('picsum.photos');

      if (response.statusCode >= 200 && response.statusCode < 300 && isImage) {
        resolve({ url, status: 'ok', statusCode: response.statusCode });
      } else {
        resolve({
          url,
          status: 'failed',
          statusCode: response.statusCode,
          reason: `Status ${response.statusCode}, Content-Type: ${contentType}`
        });
      }
    });

    request.on('error', (error) => {
      resolve({ url, status: 'error', error: error.message });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({ url, status: 'timeout', error: 'Request timeout' });
    });

    request.end();
  });
}

// Function to extract URLs from file content
function extractUrlsFromContent(content, filePath) {
  const urls = [];
  const urlRegex = /https?:\/\/[^\s"'`<>]+/g;
  let match;

  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[0].replace(/[.,!?;:]$/, ''); // Remove trailing punctuation
    if (isExternalUrl(url) && isAllowedDomain(url) && isImageUrl(url)) {
      urls.push({ url, filePath });
    }
  }

  return urls;
}

// Function to scan a file for URLs
async function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return extractUrlsFromContent(content, filePath);
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
    return [];
  }
}

// Function to scan directory recursively
async function scanDirectory(dirPath, fileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md']) {
  const urls = [];

  async function scanDir(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      // Skip backup directories and script directories that aren't part of production
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== '.next' && !item.includes('backup') && item !== 'scripts' && item !== 'automation' && item !== 'global-travel-report') {
        await scanDir(itemPath);
      } else if (stat.isFile() && fileExtensions.some(ext => item.endsWith(ext)) && !item.includes('backup') && !itemPath.includes('scripts/') && !itemPath.includes('automation/') && !itemPath.includes('global-travel-report/')) {
        const fileUrls = await scanFile(itemPath);
        urls.push(...fileUrls);
      }
    }
  }

  await scanDir(dirPath);
  return urls;
}

// Function to check URLs with rate limiting
async function checkUrls(urls) {
  const results = [];
  const batches = [];

  // Split URLs into batches
  for (let i = 0; i < urls.length; i += CONCURRENT_REQUESTS) {
    batches.push(urls.slice(i, i + CONCURRENT_REQUESTS));
  }

  for (const batch of batches) {
    const batchPromises = batch.map(async ({ url, filePath }) => {
      const result = await makeRequest(url);
      checkedUrls++;

      if (result.status !== 'ok') {
        failedUrls.push({ ...result, filePath });
      }

      return { ...result, filePath };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Progress indicator
    const progress = ((checkedUrls / totalUrls) * 100).toFixed(1);
    process.stdout.write(`\rProgress: ${checkedUrls}/${totalUrls} (${progress}%)`);

    // Small delay between batches to be respectful
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(); // New line after progress
  return results;
}

// Function to categorize failed URLs
function categorizeFailures() {
  const categorized = {
    broken: [],
    timeout: [],
    serverError: [],
    clientError: [],
    other: []
  };

  failedUrls.forEach(failure => {
    switch (failure.status) {
      case 'error':
        categorized.broken.push(failure);
        break;
      case 'timeout':
        categorized.timeout.push(failure);
        break;
      case 'failed':
        if (failure.statusCode >= 500) {
          categorized.serverError.push(failure);
        } else if (failure.statusCode >= 400) {
          categorized.clientError.push(failure);
        } else {
          categorized.other.push(failure);
        }
        break;
      default:
        categorized.other.push(failure);
    }
  });

  return categorized;
}

// Main function
async function main() {
  console.log('🔍 Starting image URL validation...\n');

  try {
    // Scan the project directory
    console.log('📁 Scanning project files for image URLs...');
    const allUrls = await scanDirectory(process.cwd());
    const uniqueUrls = [...new Set(allUrls.map(item => item.url))].map(url => {
      const original = allUrls.find(item => item.url === url);
      return { url, filePath: original.filePath };
    });

    totalUrls = uniqueUrls.length;

    if (totalUrls === 0) {
      console.log('✅ No external image URLs found to check.');
      process.exit(0);
    }

    console.log(`📊 Found ${totalUrls} unique image URLs to check\n`);

    // Check all URLs
    console.log('🔎 Checking image URLs...');
    const results = await checkUrls(uniqueUrls);

    // Categorize failures
    const categorized = categorizeFailures();

    // Report results
    console.log('\n📋 VALIDATION RESULTS');
    console.log('='.repeat(50));

    if (failedUrls.length === 0) {
      console.log('✅ All image URLs are working correctly!');
    } else {
      console.log(`❌ Found ${failedUrls.length} failed URLs out of ${totalUrls} total URLs\n`);

      // Report by category
      if (categorized.broken.length > 0) {
        console.log(`🔗 Broken URLs (${categorized.broken.length}):`);
        categorized.broken.forEach(failure => {
          console.log(`   - ${failure.url}`);
          console.log(`     File: ${failure.filePath}`);
          console.log(`     Error: ${failure.error}\n`);
        });
      }

      if (categorized.timeout.length > 0) {
        console.log(`⏰ Timeout URLs (${categorized.timeout.length}):`);
        categorized.timeout.forEach(failure => {
          console.log(`   - ${failure.url}`);
          console.log(`     File: ${failure.filePath}\n`);
        });
      }

      if (categorized.serverError.length > 0) {
        console.log(`🔥 Server Error URLs (${categorized.serverError.length}):`);
        categorized.serverError.forEach(failure => {
          console.log(`   - ${failure.url}`);
          console.log(`     File: ${failure.filePath}`);
          console.log(`     Status: ${failure.statusCode}\n`);
        });
      }

      if (categorized.clientError.length > 0) {
        console.log(`🚫 Client Error URLs (${categorized.clientError.length}):`);
        categorized.clientError.forEach(failure => {
          console.log(`   - ${failure.url}`);
          console.log(`     File: ${failure.filePath}`);
          console.log(`     Status: ${failure.statusCode}\n`);
        });
      }

      if (categorized.other.length > 0) {
        console.log(`❓ Other Issues (${categorized.other.length}):`);
        categorized.other.forEach(failure => {
          console.log(`   - ${failure.url}`);
          console.log(`     File: ${failure.filePath}`);
          console.log(`     Issue: ${failure.reason || failure.error}\n`);
        });
      }
    }

    // Summary
    console.log('📈 SUMMARY');
    console.log('-'.repeat(30));
    console.log(`Total URLs checked: ${totalUrls}`);
    console.log(`Working URLs: ${totalUrls - failedUrls.length}`);
    console.log(`Failed URLs: ${failedUrls.length}`);

    if (failedUrls.length > 0) {
      console.log(`\n⚠️  Build should fail if broken images are found.`);
      process.exit(1);
    } else {
      console.log(`\n✅ All images are working correctly!`);
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error during image validation:', error.message);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  makeRequest,
  extractUrlsFromContent,
  scanFile,
  scanDirectory,
  checkUrls
};