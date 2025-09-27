#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to convert Unsplash URL to stable Images CDN format
function convertToStableUrl(url) {
  // Pattern: https://images.unsplash.com/<path>?auto=format&q=80&w=2400
  // where <path> is the original path beginning with photo or photo ID segment

  // If already in stable format, return as is
  if (url.includes('?auto=format&q=80&w=')) {
    return url;
  }

  // Extract the photo ID from the URL
  const photoMatch = url.match(/\/photo-([^/?]+)/);
  if (photoMatch && photoMatch[1]) {
    return `https://images.unsplash.com/photo-${photoMatch[1]}?auto=format&q=80&w=2400`;
  }

  // For other formats, try to extract the path
  const pathMatch = url.match(/\/([^/?]+\.(jpg|jpeg|png|webp))/);
  if (pathMatch && pathMatch[1]) {
    return `https://images.unsplash.com/${pathMatch[1]}?auto=format&q=80&w=2400`;
  }

  // If we can't parse it, return the original URL with stable parameters
  return url.replace(/\?.*$/, '') + '?auto=format&q=80&w=2400';
}

// Function to extract Unsplash URLs from content
function extractUnsplashUrls(content) {
  const unsplashRegex = /https:\/\/images\.unsplash\.com\/[^"'\s)]+/g;
  const urls = [];
  let match;

  while ((match = unsplashRegex.exec(content)) !== null) {
    urls.push(match[0]);
  }

  return [...new Set(urls)]; // Remove duplicates
}

// Function to fix URLs in a file
function fixUrlsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    const urls = extractUnsplashUrls(content);

    for (const url of urls) {
      const stableUrl = convertToStableUrl(url);
      if (stableUrl !== url) {
        console.log(`Fixing ${url} -> ${stableUrl} in ${filePath}`);
        content = content.replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), stableUrl);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }

    return modified;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to scan and fix files
function scanAndFixFiles() {
  const results = {
    totalFiles: 0,
    filesModified: 0,
    urlsFixed: 0
  };

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== '.git') {
        scanDirectory(filePath);
      } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.json'))) {
        results.totalFiles++;

        const urls = extractUnsplashUrls(fs.readFileSync(filePath, 'utf8'));
        if (urls.length > 0) {
          console.log(`\nProcessing ${filePath} (${urls.length} Unsplash URLs found)`);

          if (fixUrlsInFile(filePath)) {
            results.filesModified++;
            results.urlsFixed += urls.length;
          }
        }
      }
    }
  }

  console.log('Scanning and fixing Unsplash URLs...\n');
  scanDirectory('.');

  return results;
}

// Main execution
function main() {
  try {
    const results = scanAndFixFiles();

    console.log('\n=== FIX RESULTS ===');
    console.log(`Total files scanned: ${results.totalFiles}`);
    console.log(`Files modified: ${results.filesModified}`);
    console.log(`URLs fixed: ${results.urlsFixed}`);

    if (results.filesModified > 0) {
      console.log('\n✅ Successfully fixed broken Unsplash URLs!');
      console.log('All URLs now use the stable Images CDN format: ?auto=format&q=80&w=2400');
    } else {
      console.log('\n✅ No broken URLs found that needed fixing!');
    }
  } catch (error) {
    console.error('Error during fix:', error);
    process.exit(1);
  }
}

main();