export interface AffiliatePartner {
  name: string;
  url: string;
  logo: string; // Path to logo image
  alt: string;
  description: string;
}

export const affiliatePartners: AffiliatePartner[] = [
  {
    name: 'Trip.com',
    url: 'https://trip.tpk.mx/qhlnnQh8',
    logo: '/images/affiliates/tripcom-logo.svg',
    alt: 'Trip.com - Global travel booking platform',
    description: 'Global travel booking platform offering hotels, flights, and attractions'
  },
  {
    name: 'Welcome Pickups',
    url: 'https://tpk.mx/NGGoA86T',
    logo: '/images/affiliates/welcome-pickups-logo.svg',
    alt: 'Welcome Pickups - Airport transfer service',
    description: 'Premium airport transfer service with local drivers'
  },
  {
    name: 'Yesim',
    url: 'https://yesim.tpk.mx/RyZzDsxA',
    logo: '/images/affiliates/yesim-logo.svg',
    alt: 'Yesim - eSIM data plans for travelers',
    description: 'Global eSIM data plans for international travelers'
  },
  {
    name: 'EKTA',
    url: 'https://ektatraveling.tpk.mx/IUGS6Ovk',
    logo: '/images/affiliates/ekta-logo.svg',
    alt: 'EKTA - Ethical travel accessories',
    description: 'Sustainable and ethical travel accessories'
  },
  {
    name: 'Kiwitaxi',
    url: 'https://kiwitaxi.tpk.mx/NGL3ovB3',
    logo: '/images/affiliates/kiwitaxi-logo.svg',
    alt: 'Kiwitaxi - Airport transfer booking',
    description: 'Reliable airport transfer booking worldwide'
  },
  {
    name: 'Airalo',
    url: 'https://airalo.tpk.mx/M99krJZy',
    logo: '/images/affiliates/airalo-logo.svg',
    alt: 'Airalo - eSIM store for travelers',
    description: 'World\'s first eSIM store for international travelers'
  },
  {
    name: 'GetRentacar.com',
    url: 'https://getrentacar.tpk.mx/I3FuOWfB',
    logo: '/images/affiliates/getrentacar-logo.svg',
    alt: 'GetRentacar.com - Car rental platform',
    description: 'Global car rental platform with competitive prices'
  },
  {
    name: 'Surfshark VPN',
    url: 'https://get.surfshark.net/aff_c?offer_id=926&aff_id=39802',
    logo: '/images/affiliates/surfshark-vpn-logo.svg',
    alt: 'Surfshark VPN - Secure VPN service',
    description: 'Fast and secure VPN service for travelers'
  },
  {
    name: 'Surfshark One',
    url: 'https://get.surfshark.net/aff_c?offer_id=1249&aff_id=39802',
    logo: '/images/affiliates/surfshark-one-logo.svg',
    alt: 'Surfshark One - All-in-one privacy suite',
    description: 'Complete privacy and security suite'
  },
  {
    name: 'Wise',
    url: 'https://wise.com/invite/ihpc/rodneyowenp?utm_source=ios-pill-hp-copylink&utm_medium=invite&utm_campaign=&utm_content=&referralCode=rodneyowenp',
    logo: '/images/affiliates/wise-logo.svg',
    alt: 'Wise - International money transfers',
    description: 'Fast and low-cost international money transfers'
  }
];

// Fallback placeholder for missing logos
export const getAffiliateLogoFallback = (partnerName: string): string => {
  return `/images/affiliates/placeholder.svg`;
};

// Cache key for verification results
export const AFFILIATE_CACHE_KEY = 'affiliate_verification_cache';
export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds