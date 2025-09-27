#!/usr/bin/env node

/**
 * Social Media Preview Validation Script
 * Tests Open Graph and Twitter Card metadata for proper rendering
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://globaltravelreport.com';
const TEST_PAGES = [
  '/',
  '/category-index',
  '/stories-index',
  '/partners',
  '/destinations'
];

async function validateSocialPreviews() {
  console.log('🔍 Validating social media previews...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];

  for (const pagePath of TEST_PAGES) {
    const fullUrl = `${BASE_URL}${pagePath}`;
    console.log(`Testing: ${fullUrl}`);

    try {
      const page = await browser.newPage();

      // Set user agent to avoid blocking
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      // Navigate to page
      await page.goto(fullUrl, { waitUntil: 'networkidle0', timeout: 30000 });

      // Extract Open Graph data
      const ogData = await page.evaluate(() => {
        const getMetaProperty = (property) => {
          const meta = document.querySelector(`meta[property="${property}"]`);
          return meta ? meta.getAttribute('content') : null;
        };

        const getMetaName = (name) => {
          const meta = document.querySelector(`meta[name="${name}"]`);
          return meta ? meta.getAttribute('content') : null;
        };

        return {
          title: getMetaProperty('og:title') || document.title,
          description: getMetaProperty('og:description') || getMetaName('description'),
          image: getMetaProperty('og:image'),
          url: getMetaProperty('og:url'),
          type: getMetaProperty('og:type'),
          twitterTitle: getMetaName('twitter:title'),
          twitterImage: getMetaName('twitter:image'),
          canonical: document.querySelector('link[rel="canonical"]')?.href
        };
      });

      // Validate data
      const validation = {
        url: fullUrl,
        hasTitle: !!ogData.title,
        hasDescription: !!ogData.description,
        hasImage: !!ogData.image,
        hasCanonical: !!ogData.canonical,
        imageUrl: ogData.image,
        title: ogData.title,
        description: ogData.description
      };

      results.push(validation);

      // Log results
      console.log(`✅ ${fullUrl}:`);
      console.log(`   Title: ${ogData.title ? '✅' : '❌'} ${ogData.title || 'Missing'}`);
      console.log(`   Description: ${ogData.description ? '✅' : '❌'} ${ogData.description ? 'Present' : 'Missing'}`);
      console.log(`   Image: ${ogData.image ? '✅' : '❌'} ${ogData.image || 'Missing'}`);
      console.log(`   Canonical: ${ogData.canonical ? '✅' : '❌'} ${ogData.canonical || 'Missing'}`);
      console.log('');

    } catch (error) {
      console.log(`❌ ${fullUrl}: Error - ${error.message}`);
      results.push({
        url: fullUrl,
        error: error.message,
        hasTitle: false,
        hasDescription: false,
        hasImage: false,
        hasCanonical: false
      });
    }
  }

  await browser.close();

  // Generate summary report
  const summary = {
    totalPages: results.length,
    successful: results.filter(r => r.hasTitle && r.hasDescription && r.hasImage).length,
    withErrors: results.filter(r => r.error).length,
    results
  };

  console.log('📊 Social Media Preview Validation Summary:');
  console.log(`Total Pages Tested: ${summary.totalPages}`);
  console.log(`Fully Valid Pages: ${summary.successful}`);
  console.log(`Pages with Errors: ${summary.withErrors}`);
  console.log(`Success Rate: ${Math.round((summary.successful / summary.totalPages) * 100)}%`);

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'social-preview-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  return summary;
}

// CLI execution
if (require.main === module) {
  validateSocialPreviews()
    .then((summary) => {
      if (summary.successful === summary.totalPages) {
        console.log('\n🎉 All social media previews are properly configured!');
        process.exit(0);
      } else {
        console.log(`\n⚠️  ${summary.withErrors} pages need attention.`);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validateSocialPreviews };