#!/usr/bin/env node

/**
 * Affiliate Link Verification Script
 * Tests all affiliate partner URLs for accessibility and response status
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Affiliate partners data
const AFFILIATE_PARTNERS = [
  { name: 'Trip.com', url: 'https://trip.tpk.mx/qhlnnQh8' },
  { name: 'Welcome Pickups', url: 'https://tpk.mx/NGGoA86T' },
  { name: 'Yesim', url: 'https://yesim.tpk.mx/RyZzDsxA' },
  { name: 'EKTA', url: 'https://ektatraveling.tpk.mx/IUGS6Ovk' },
  { name: 'Kiwitaxi', url: 'https://kiwitaxi.tpk.mx/NGL3ovB3' },
  { name: 'Airalo', url: 'https://airalo.tpk.mx/M99krJZy' },
  { name: 'GetRentacar.com', url: 'https://getrentacar.tpk.mx/I3FuOWfB' },
  { name: 'Surfshark VPN', url: 'https://get.surfshark.net/aff_c?offer_id=926&aff_id=39802' },
  { name: 'Surfshark One', url: 'https://get.surfshark.net/aff_c?offer_id=1249&aff_id=39802' },
  { name: 'Wise', url: 'https://wise.com/invite/ihpc/rodneyowenp?utm_source=ios-pill-hp-copylink&utm_medium=invite&utm_campaign=&utm_content=&referralCode=rodneyowenp' }
];

// Verification function
function verifyUrl(url, partnerName) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const httpModule = parsedUrl.protocol === 'https:' ? https : http;

    const req = httpModule.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'HEAD',
      timeout: 5000,
      headers: {
        'User-Agent': 'GlobalTravelReport-AffiliateVerifier/1.0'
      }
    }, (res) => {
      resolve({
        partner: partnerName,
        url: url,
        status: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400,
        responseTime: Date.now()
      });
    });

    req.on('error', (err) => {
      resolve({
        partner: partnerName,
        url: url,
        error: err.message,
        success: false,
        responseTime: Date.now()
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        partner: partnerName,
        url: url,
        error: 'Timeout',
        success: false,
        responseTime: Date.now()
      });
    });

    req.end();
  });
}

// Main verification function
async function verifyAllAffiliates() {
  console.log('🔍 Verifying affiliate partner links...\n');

  const results = [];

  for (const partner of AFFILIATE_PARTNERS) {
    console.log(`Testing ${partner.name}...`);
    const result = await verifyUrl(partner.url, partner.name);
    results.push(result);

    if (result.success) {
      console.log(`✅ ${partner.name}: ${result.status} (${result.responseTime}ms)`);
    } else {
      console.log(`❌ ${partner.name}: ${result.error || `HTTP ${result.status}`}`);
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n📊 Verification Summary:');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((successful / results.length) * 100)}%`);

  // Detailed results
  if (failed > 0) {
    console.log('\n❌ Failed Links:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`• ${r.partner}: ${r.error || `HTTP ${r.status}`}`);
    });
  }

  return {
    total: results.length,
    successful,
    failed,
    successRate: Math.round((successful / results.length) * 100),
    results
  };
}

// CLI execution
if (require.main === module) {
  verifyAllAffiliates()
    .then((summary) => {
      if (summary.failed > 0) {
        process.exit(1); // Exit with error code if any links failed
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyAllAffiliates, verifyUrl };