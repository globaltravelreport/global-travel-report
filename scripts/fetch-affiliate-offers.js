#!/usr/bin/env node

/**
 * Affiliate Offers Auto-Refresh Script
 * Fetches and updates affiliate offers from partner APIs
 * Saves to /content/offers/ for the /offers page
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Create content directory if it doesn't exist
const CONTENT_DIR = path.join(process.cwd(), 'content');
const OFFERS_DIR = path.join(CONTENT_DIR, 'offers');

if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

if (!fs.existsSync(OFFERS_DIR)) {
  fs.mkdirSync(OFFERS_DIR, { recursive: true });
}

// Affiliate partner configurations
const AFFILIATE_PARTNERS = {
  'tripcom': {
    name: 'Trip.com',
    baseUrl: 'https://trip.tpk.mx/qhlnnQh8',
    logo: '/affiliates/tripcom-logo.svg',
    description: 'Global travel booking platform offering hotels, flights, and attractions',
    apiEndpoint: null, // No public API, use static offers
    offers: [
      {
        title: 'Global Hotel Deals',
        description: 'Book hotels worldwide with exclusive discounts up to 50% off',
        affiliate_url: 'https://trip.tpk.mx/qhlnnQh8',
        price: 'From $49',
        currency: 'USD',
        category: 'accommodation'
      },
      {
        title: 'Flight + Hotel Packages',
        description: 'Save up to 30% on combined flight and hotel bookings',
        affiliate_url: 'https://trip.tpk.mx/qhlnnQh8',
        price: 'From $299',
        currency: 'USD',
        category: 'packages'
      }
    ]
  },
  'kiwitaxi': {
    name: 'Kiwitaxi',
    baseUrl: 'https://kiwitaxi.tpk.mx/NGL3ovB3',
    logo: '/affiliates/kiwitaxi-logo.svg',
    description: 'Reliable airport transfer booking worldwide',
    apiEndpoint: null,
    offers: [
      {
        title: 'Airport Transfers',
        description: 'Professional airport transfer service with English-speaking drivers',
        affiliate_url: 'https://kiwitaxi.tpk.mx/NGL3ovB3',
        price: 'From $25',
        currency: 'USD',
        category: 'transportation'
      }
    ]
  },
  'yesim': {
    name: 'Yesim',
    baseUrl: 'https://yesim.tpk.mx/RyZzDsxA',
    logo: '/affiliates/yesim-logo.svg',
    description: 'Global eSIM data plans for international travelers',
    apiEndpoint: null,
    offers: [
      {
        title: 'Global eSIM Data Plans',
        description: 'Stay connected worldwide with affordable eSIM data plans',
        affiliate_url: 'https://yesim.tpk.mx/RyZzDsxA',
        price: 'From $9.90',
        currency: 'USD',
        category: 'connectivity'
      }
    ]
  },
  'surfshark-vpn': {
    name: 'Surfshark VPN',
    baseUrl: 'https://get.surfshark.net/aff_c?offer_id=926&aff_id=39802',
    logo: '/affiliates/surfshark-vpn-logo.svg',
    description: 'Fast and secure VPN service for travelers',
    apiEndpoint: null,
    offers: [
      {
        title: 'VPN for Travelers',
        description: 'Secure your connection and access content worldwide',
        affiliate_url: 'https://get.surfshark.net/aff_c?offer_id=926&aff_id=39802',
        price: '$2.49/month',
        currency: 'USD',
        category: 'security'
      }
    ]
  },
  'wise': {
    name: 'Wise',
    baseUrl: 'https://wise.com/invite/ihpc/rodneyowenp?utm_source=ios-pill-hp-copylink&utm_medium=invite&utm_campaign=&utm_content=&referralCode=rodneyowenp',
    logo: '/affiliates/wise-logo.svg',
    description: 'Fast and low-cost international money transfers',
    apiEndpoint: null,
    offers: [
      {
        title: 'International Money Transfer',
        description: 'Send money abroad with low fees and real exchange rates',
        affiliate_url: 'https://wise.com/invite/ihpc/rodneyowenp?utm_source=ios-pill-hp-copylink&utm_medium=invite&utm_campaign=&utm_content=&referralCode=rodneyowenp',
        price: 'From $0',
        currency: 'USD',
        category: 'finance'
      }
    ]
  }
};

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const module = parsedUrl.protocol === 'https:' ? https : http;

    const req = module.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'GlobalTravelReport-OfferFetcher/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Fetch offers for a specific partner
async function fetchPartnerOffers(partnerKey, partnerConfig) {
  console.log(`Fetching offers for ${partnerConfig.name}...`);

  try {
    // For now, use static offers since most partners don't have public APIs
    const offers = partnerConfig.offers.map(offer => ({
      ...offer,
      partner: partnerConfig.name,
      partner_logo: partnerConfig.logo,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      lastUpdated: new Date().toISOString(),
      source: 'static'
    }));

    return offers;
  } catch (error) {
    console.error(`Error fetching offers for ${partnerConfig.name}:`, error.message);
    return [];
  }
}

// Save offers to JSON file
function saveOffersToFile(partnerKey, offers) {
  const filePath = path.join(OFFERS_DIR, `${partnerKey}.json`);

  const data = {
    partner: AFFILIATE_PARTNERS[partnerKey].name,
    partnerKey: partnerKey,
    logo: AFFILIATE_PARTNERS[partnerKey].logo,
    baseUrl: AFFILIATE_PARTNERS[partnerKey].baseUrl,
    offers: offers,
    lastUpdated: new Date().toISOString(),
    totalOffers: offers.length
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ Saved ${offers.length} offers for ${AFFILIATE_PARTNERS[partnerKey].name} to ${filePath}`);
}

// Main function
async function fetchAllAffiliateOffers() {
  console.log('🚀 Starting affiliate offers refresh...\n');

  let totalOffers = 0;
  const results = [];

  for (const [partnerKey, partnerConfig] of Object.entries(AFFILIATE_PARTNERS)) {
    try {
      const offers = await fetchPartnerOffers(partnerKey, partnerConfig);

      if (offers.length > 0) {
        saveOffersToFile(partnerKey, offers);
        totalOffers += offers.length;
        results.push({
          partner: partnerConfig.name,
          offers: offers.length,
          success: true
        });
      } else {
        results.push({
          partner: partnerConfig.name,
          offers: 0,
          success: false,
          error: 'No offers returned'
        });
      }
    } catch (error) {
      results.push({
        partner: partnerConfig.name,
        offers: 0,
        success: false,
        error: error.message
      });
    }
  }

  // Generate summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n📊 Affiliate Offers Refresh Summary:');
  console.log(`Total Partners: ${Object.keys(AFFILIATE_PARTNERS).length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total Offers: ${totalOffers}`);
  console.log(`Success Rate: ${Math.round((successful / Object.keys(AFFILIATE_PARTNERS).length) * 100)}%`);

  // Detailed results
  if (failed > 0) {
    console.log('\n❌ Failed Partners:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`• ${r.partner}: ${r.error}`);
    });
  }

  return {
    totalPartners: Object.keys(AFFILIATE_PARTNERS).length,
    successful,
    failed,
    totalOffers,
    successRate: Math.round((successful / Object.keys(AFFILIATE_PARTNERS).length) * 100),
    results
  };
}

// CLI execution
if (require.main === module) {
  fetchAllAffiliateOffers()
    .then((summary) => {
      console.log('\n🎉 Affiliate offers refresh completed!');
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Fatal error during affiliate offers refresh:', error);
      process.exit(1);
    });
}

module.exports = { fetchAllAffiliateOffers, fetchPartnerOffers };