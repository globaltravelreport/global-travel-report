
/**
 * Global Travel Report Service Worker
 * Generated on: 2025-05-04T11:47:12.462Z
 * Cache version: 20250504
 */

// Cache names
const PRECACHE = 'global-travel-report-v20250504-precache';
const RUNTIME = 'global-travel-report-v20250504-runtime';
const IMAGE_CACHE = 'global-travel-report-v20250504-images';
const API_CACHE = 'global-travel-report-v20250504-api';

// Assets to precache
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/logo-gtr.png",
  "/favicon.ico",
  "/manifest.json",
  "/css/main.css",
  "/js/main.js"
];

// Additional static assets to cache on first use
const CACHEABLE_STATIC_ASSETS = [
  "/stories/best-hotels-paris.json",
  "/stories/best-travel-credit-cards.json",
  "/stories/first-class-train-journeys.json",
  "/stories/index.json",
  "/stories/luxury-resorts-maldives.json",
  "/stories/manifest.json",
  "/stories/safari-lodges-africa.json",
  "/stories/tokyo-street-scene.json",
  "/stories/top-airlines-business-class.json",
  "/structured-data/1-asias-latest-museums-a-must-visit-for-aussie-explorers.json",
  "/structured-data/1-asias-newest-museums-a-guide-for-aussie-explorers.json",
  "/structured-data/1-asias-newest-museums-a-must-visit-for-aussie-travellers.json",
  "/structured-data/1-asias-newest-museums-a-must-visit-for-aussies.json",
  "/structured-data/1-direct-flights-to-doha-your-gateway-to-qatar-from-manila-2.json",
  "/structured-data/1-direct-flights-to-doha-your-gateway-to-the-middle-east.json",
  "/structured-data/1-direct-manila-doha-flights-your-gateway-to-adventure.json",
  "/structured-data/1-discover-5-hidden-gems-perfect-for-aussie-explorers-in-202.json",
  "/structured-data/1-discover-copenhagen-direct-flights-from-china-eastern-airl.json",
  "/structured-data/1-discover-hidden-gems-5-must-see-places-for-aussies-in-2025.json",
  "/structured-data/1-discover-iraklio-greeces-cruise-gem-for-aussies.json",
  "/structured-data/1-discover-manila-your-ultimate-guide-to-flying-from-austral.json",
  "/structured-data/1-discover-pragues-luxury-a-perfect-getaway-for-aussies.json",
  "/structured-data/1-discover-thailand-new-deals-to-spark-aussie-wanderlust-2.json",
  "/structured-data/1-dubai-travel-guide-for-aussies-navigating-new-norms.json",
  "/structured-data/1-explore-asias-newest-museums-a-guide-for-aussie-explorers.json",
  "/structured-data/1-explore-asias-newest-museums-a-guide-for-aussie-travellers.json",
  "/structured-data/1-explore-asias-newest-museums-a-guide-for-aussies.json",
  "/structured-data/1-explore-doha-direct-flights-from-manila-with-philippine-ai.json",
  "/structured-data/1-explore-hidden-gems-5-must-visit-spots-for-aussies-in-2025.json",
  "/structured-data/1-explore-iraklio-a-cruise-gem-for-australian-adventurers.json",
  "/structured-data/1-explore-manila-new-qatar-airways-codeshare-flights-for-aus.json",
  "/structured-data/1-explore-manila-with-direct-flights-from-doha-a-guide-for-a.json",
  "/structured-data/1-explore-manila-with-qatar-airways-a-guide-for-aussies.json",
  "/structured-data/1-explore-manila-with-qatar-airways-your-australian-gateway.json",
  "/structured-data/1-exploring-asias-newest-museums-a-guide-for-aussies-2.json",
  "/structured-data/1-exploring-scotland-by-sea-a-cruise-adventure-from-australi.json",
  "/structured-data/1-fly-direct-manila-to-doha-with-philippine-airlines-qatar-a.json",
  "/structured-data/1-global-getaways-a-guide-for-aussies-to-world-travel-2.json",
  "/structured-data/1-jetstars-mega-sale-50-flights-for-aussies-to-global-hotspo.json",
  "/structured-data/1-new-direct-flights-from-copenhagen-to-boost-aussie-travels.json",
  "/structured-data/1-new-qatar-philippine-airlines-deal-your-gateway-to-manila-.json",
  "/structured-data/1-pakistan-airspace-closure-affects-aussie-travellers-know-m.json",
  "/structured-data/1-pakistan-airspace-closure-what-aussies-need-to-know.json",
  "/structured-data/1-scotlands-cruise-boom-a-130m-lift-aussie-guide.json",
  "/structured-data/1-scotlands-cruise-boom-a-130m-lift-tips-for-aussies.json",
  "/structured-data/1-scotlands-cruise-boom-a-130m-windfall-aussie-guide.json",
  "/structured-data/1-seo-optimized-title-unlock-thailand-subsidized-flights-tip.json",
  "/structured-data/1-star-voyager-thailands-new-luxury-cruise-awaits-aussie-tra.json",
  "/structured-data/1-star-voyager-thailands-new-luxury-liner-awaits-aussie-expl.json",
  "/structured-data/1-thailands-new-flight-deals-spark-interest-for-aussie-touri.json",
  "/structured-data/1-top-5-hidden-gems-abroad-for-aussie-explorers-in-2025.json",
  "/structured-data/1-top-5-hidden-gems-for-aussie-globetrotters-in-2025.json",
  "/structured-data/1-top-5-hidden-gems-for-aussie-travellers-in-2025.json",
  "/structured-data/1-top-5-underrated-gems-for-aussie-explorers-in-2025.json",
  "/structured-data/1-top-noise-cancelling-headphones-for-aussie-globetrotters.json",
  "/structured-data/1-top-noise-cancelling-headphones-for-aussie-travellers-a-mu.json",
  "/structured-data/1-top-noise-cancelling-headphones-for-aussie-travellers-ulti.json",
  "/structured-data/1-top-noise-cancelling-headsets-for-aussie-travellers-best-b.json",
  "/structured-data/1-uk-travel-guide-for-aussies-best-deals-tips-2023.json",
  "/structured-data/1-uk-travel-guide-for-aussies-must-know-tips-tricks.json",
  "/structured-data/1-uk-travel-guide-for-aussies-tips-best-times-to-visit.json",
  "/structured-data/1-uk-travel-guide-for-aussies-tips-must-knows-for-2023.json",
  "/structured-data/1-uk-travel-guide-for-aussies-tips-prices-best-times-to-visi.json",
  "/structured-data/1-uk-travel-guide-tips-for-aussies-planning-their-british-es.json",
  "/structured-data/1-uk-travel-guide-tips-insights-for-aussie-explorers.json",
  "/structured-data/1-uk-travel-guide-tips-tricks-for-aussies-abroad-2.json",
  "/structured-data/1-ultimate-guide-best-noise-cancelling-headphones-for-aussie.json",
  "/structured-data/2025-04-24-australias-maritime-tourism-charting-a-course-towards-spectacular-growth.json",
  "/structured-data/2025-04-24-australias-maritime-tourism-sailing-towards-unprecedented-growth.json",
  "/structured-data/2025-04-24-explore-the-whitsundays-by-sail.json",
  "/structured-data/2025-04-24-hidden-gems-of-southeast-asia.json",
  "/structured-data/2025-04-24-southeast-asia-the-new-favorite-of-australian-travelers.json",
  "/structured-data/2025-04-24-southeast-asia-the-new-favourite-playground-for-australian-tourists.json",
  "/structured-data/2025-04-24-the-land-of-the-rising-sun-australias-top-holiday-destination.json",
  "/structured-data/2025-04-24-the-land-of-the-rising-sun-beckons-why-australians-cant-get-enough-of-japan.json",
  "/structured-data/asias-latest-museums-a-must-see-for-aussie-explorers.json",
  "/structured-data/best-noise-cancelling-headphones-for-aussie-travellers.json",
  "/structured-data/china-eastern-airlines-launches-copenhagen-routes.json",
  "/structured-data/explore-heraklion-your-next-cruise-destination-from-australi.json",
  "/structured-data/explore-the-shanghai-cruise-culture-tourism-festival.json",
  "/structured-data/exploring-ascotts-innovative-hospitality-strategy.json",
  "/structured-data/exploring-the-surge-in-cruise-tourism-trends-and-future-insi.json",
  "/structured-data/fly-direct-manila-to-doha-with-philippine-airlines-qatar-air.json",
  "/structured-data/fly-direct-to-copenhagen-from-australia-with-china-eastern.json",
  "/structured-data/hidden-gems-top-international-destinations-for-aussies-in-20.json",
  "/structured-data/index.json",
  "/structured-data/iraklio-port-a-new-hub-for-cruise-tourism-in-greece.json",
  "/structured-data/my-daily-drop-pro-review-1746345265357.json",
  "/structured-data/my-daily-drop-pro-review.json",
  "/structured-data/title-a-gastronomic-globe-trot-savouring-the-world-one-bite-at-a-time.json",
  "/structured-data/title-a-gastronomic-odyssey-roaming-the-globe-through-its-plates.json",
  "/structured-data/title-a-surge-in-seafaring-the-latest-headlines-from-the-world-of-luxury-cruising.json",
  "/structured-data/title-carnival-cruise-line-declines-to-reintroduce-individual-cereal-boxes.json",
  "/structured-data/title-cayman-islands-puts-a-hold-on-cruise-infrastructure-expansion.json",
  "/structured-data/title-cayman-islands-rejects-expansion-of-cruise-infrastructure-a-triumph-for-sustainability.json",
  "/structured-data/title-cruise-conundrum-cayman-islands-says-no-to-cruise-infrastructure-expansion.json",
  "/structured-data/title-discovering-mackinac-island-a-novice-s-guide-to-an-iconic-midwestern-haven.json",
  "/structured-data/title-embracing-green-horizons-the-future-of-sustainable-travel-in-2025.json",
  "/structured-data/title-emerging-destinations-a-guide-to-the-top-cities-for-the-digital-nomad.json",
  "/structured-data/title-exquisite-european-escapades-unveiling-15-of-the-continent-s-most-stunning-destinations.json",
  "/structured-data/title-italy-uncovered-savouring-the-splendours-of-the-peninsula-on-a-budget.json",
  "/structured-data/title-journey-through-the-wild-top-12-trails-of-patagonia.json",
  "/structured-data/title-navigating-the-high-seas-a-weekly-cruise-line-overview.json",
  "/structured-data/title-navigating-the-seas-unfolding-the-latest-developments-in-the-cruise-industry.json",
  "/structured-data/title-new-zealand-the-rising-star-of-adventure-tourism.json",
  "/structured-data/title-rail-journey-through-mexico-a-scenic-expedition.json",
  "/structured-data/title-savouring-italy-a-budget-friendly-guide-to-uncovering-la-bella-vita.json",
  "/structured-data/title-savouring-lisbon-the-ideal-three-day-travel-guide.json",
  "/structured-data/title-the-green-transformation-predictions-for-sustainable-tourism-in-2025.json",
  "/structured-data/title-the-resurgence-of-new-zealand-s-thrill-seeker-tourism.json",
  "/structured-data/title-trailblazing-cities-for-global-telecommuters-embracing-the-digital-nomad-revolution.json",
  "/structured-data/title-uncovering-italy-s-charms-a-guide-for-the-budget-conscious-traveller.json",
  "/structured-data/title-unearthing-the-undiscovered-treasures-of-southeast-asia.json",
  "/structured-data/title-unfolding-the-mysteries-of-southeast-asia-a-journey-beyond-the-ordinary.json",
  "/structured-data/top-noise-cancelling-headphones-for-travelers.json",
  "/structured-data/uk-tourism-concerns-industry-claims-government-impact.json",
  "/structured-data/uk-travel-woes-what-aussies-need-to-know.json",
  "/structured-data/wildlife-adventures-outearn-illegal-trade-globally.json"
];

// Install event - precache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME, IMAGE_CACHE, API_CACHE];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => {
        // Keep caches that start with our cache name but aren't in our current caches
        return cacheName.startsWith('global-travel-report-') &&
               !currentCaches.includes(cacheName);
      });
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // URL object for easier parsing
  const url = new URL(event.request.url);

  // Handle API requests (network-first strategy)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Handle image requests (cache-first with timeout)
  if (
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/) ||
    url.pathname.includes('/images/') ||
    url.pathname.includes('/img/')
  ) {
    event.respondWith(cacheFirstWithTimeout(event.request));
    return;
  }

  // Handle static assets (cache-first strategy)
  if (
    CACHEABLE_STATIC_ASSETS.includes(url.pathname) ||
    url.pathname.match(/\.(css|js|woff2|json)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Handle navigation requests (network-first with offline fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(event.request));
    return;
  }

  // Default strategy (network-first)
  event.respondWith(networkFirst(event.request));
});

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Cache valid responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return offline fallback if available
    return caches.match('/offline');
  }
}

// Cache-first with timeout strategy
async function cacheFirstWithTimeout(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // If not in cache, try network with timeout
  try {
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), 3000);
    });

    // Race between network and timeout
    const response = await Promise.race([networkPromise, timeoutPromise]);

    // Cache the response if valid
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Return placeholder image or offline fallback
    return caches.match('/images/placeholder.jpg') || new Response('Image not available', { status: 408 });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache valid responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback if available
    return caches.match('/offline');
  }
}

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache valid responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return empty JSON for API requests
    return new Response(JSON.stringify({ error: 'Offline', message: 'You are currently offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Network-first with offline fallback for navigation
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache valid responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return caches.match('/offline');
  }
}
  