/**
 * Central affiliate link registry.
 * 
 * - Keep all affiliate metadata here.
 * - Do NOT modify the href values handed to us (tracking params must remain intact).
 */

export type AffiliateCategory =
  | 'Flights'
  | 'Transfers'
  | 'eSIM'
  | 'Insurance'
  | 'VPN'
  | 'Finance'
  | 'Taxi'
  | 'Cars'
  | 'General';

export interface AffiliateMeta {
  id: string;
  name: string;
  href: string; // must be preserved exactly as provided
  category: AffiliateCategory;
  short: string; // short description for compact components
  brandColor?: string;
  brandTextColor?: string;
  iconEmoji?: string; // simple branding for lightweight UI
}

export const AFFILIATES: AffiliateMeta[] = [
  {
    id: 'tripcom',
    name: 'Trip.com',
    href: 'https://trip.tpk.mx/qhlnnQh8',
    category: 'Flights',
    short: 'Compare flights and hotels worldwide',
    brandColor: '#287dfa',
    brandTextColor: '#ffffff',
    iconEmoji: '✈️',
  },
  {
    id: 'welcome-pickups',
    name: 'Welcome Pickups',
    href: 'https://tpk.mx/NGGoA86T',
    category: 'Transfers',
    short: 'Trusted airport and city transfers',
    brandColor: '#111827',
    brandTextColor: '#ffffff',
    iconEmoji: '🚖',
  },
  {
    id: 'yesim',
    name: 'Yesim',
    href: 'https://yesim.tpk.mx/RyZzDsxA',
    category: 'eSIM',
    short: 'Global eSIM for instant mobile data',
    brandColor: '#00bcd4',
    brandTextColor: '#002b36',
    iconEmoji: '📶',
  },
  {
    id: 'ekta',
    name: 'EKTA',
    href: 'https://ektatraveling.tpk.mx/IUGS6Ovk',
    category: 'Insurance',
    short: 'Flexible travel insurance',
    brandColor: '#0ea5e9',
    brandTextColor: '#ffffff',
    iconEmoji: '🛡️',
  },
  {
    id: 'kiwitaxi',
    name: 'Kiwitaxi',
    href: 'https://kiwitaxi.tpk.mx/NGL3ovB3',
    category: 'Taxi',
    short: 'Private transfers worldwide',
    brandColor: '#f59e0b',
    brandTextColor: '#111827',
    iconEmoji: '🚕',
  },
  {
    id: 'airalo',
    name: 'Airalo',
    href: 'https://airalo.tpk.mx/M99krJZy',
    category: 'eSIM',
    short: 'Affordable eSIMs in 200+ countries',
    brandColor: '#e11d48',
    brandTextColor: '#ffffff',
    iconEmoji: '🛰️',
  },
  {
    id: 'getrentacar',
    name: 'GetRentacar.com',
    href: 'https://getrentacar.tpk.mx/I3FuOWfB',
    category: 'Cars',
    short: 'Great value car rentals',
    brandColor: '#10b981',
    brandTextColor: '#031b1b',
    iconEmoji: '🚗',
  },
  {
    id: 'surfshark-vpn',
    name: 'Surfshark VPN',
    href: 'https://get.surfshark.net/aff_c?offer_id=926&aff_id=39802',
    category: 'VPN',
    short: 'Secure, fast VPN for travelers',
    brandColor: '#0b8',
    brandTextColor: '#ffffff',
    iconEmoji: '🛡️',
  },
  {
    id: 'surfshark-one',
    name: 'Surfshark One',
    href: 'https://get.surfshark.net/aff_c?offer_id=1249&aff_id=39802',
    category: 'VPN',
    short: 'All-in-one privacy suite',
    brandColor: '#0b8',
    brandTextColor: '#ffffff',
    iconEmoji: '🔒',
  },
  {
    id: 'wise',
    name: 'Wise',
    href: 'https://wise.com/invite/ihpc/rodneyowenp?utm_source=ios-pill-hp-copylink&utm_medium=invite&utm_campaign=&utm_content=&referralCode=rodneyowenp',
    category: 'Finance',
    short: 'Low-fee foreign transfers and cards',
    brandColor: '#00b9ff',
    brandTextColor: '#002b36',
    iconEmoji: '💳',
  },
];

/**
 * Get an affiliate by id
 */
export function getAffiliate(id: string): AffiliateMeta | undefined {
  return AFFILIATES.find(a => a.id === id);
}

/**
 * Curated/rotating set for header dropdown (limit to 6).
 * Keep a balanced mix for general appeal.
 */
export const HEADER_AFFILIATE_IDS: string[] = [
  'tripcom',
  'welcome-pickups',
  'airalo',
  'yesim',
  'wise',
  'ekta',
];

/**
 * Convenience set for home mid-page section (3–6 items).
 */
export const HOME_TOOLS_IDS: string[] = [
  'tripcom',
  'airalo',
  'welcome-pickups',
  'getrentacar',
  'wise',
  'ekta',
];

/**
 * A deterministic, context-aware pick for pages.
 * Use a consistent choice based on the route to avoid client-only randomness.
 */
export function pickAffiliateForRoute(route: string): AffiliateMeta {
  // Map host paths to categories for contextual relevance
  if (route.startsWith('/countries') || route.startsWith('/destinations')) {
    return getAffiliate('welcome-pickups') || AFFILIATES[0];
  }
  if (route.startsWith('/categories/finance')) {
    return getAffiliate('wise') || AFFILIATES[0];
  }
  if (route.startsWith('/categories/mobile') || route.includes('e-sim')) {
    return getAffiliate('airalo') || AFFILIATES[0];
  }
  if (route.startsWith('/stories')) {
    // Generic, but travel-relevant
    return getAffiliate('tripcom') || AFFILIATES[0];
  }
  // Fallback stable pick
  return getAffiliate('tripcom') || AFFILIATES[0];
}