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
    logo: '/affiliates/tripcom-logo.svg',
    alt: 'Trip.com - Global travel booking platform',
    description: 'Global travel booking platform offering hotels, flights, and attractions'
  },
  {
    name: 'Welcome Pickups',
    url: 'https://tpk.mx/NGGoA86T',
    logo: '/affiliates/welcome-pickups-logo.svg',
    alt: 'Welcome Pickups - Airport transfer service',
    description: 'Premium airport transfer service with local drivers'
  },
  {
    name: 'Yesim',
    url: 'https://yesim.tpk.mx/RyZzDsxA',
    logo: '/affiliates/yesim-logo.svg',
    alt: 'Yesim - eSIM data plans for travelers',
    description: 'Global eSIM data plans for international travelers'
  },
  {
    name: 'EKTA',
    url: 'https://ektatraveling.tpk.mx/IUGS6Ovk',
    logo: '/affiliates/ekta-logo.svg',
    alt: 'EKTA - Ethical travel accessories',
    description: 'Sustainable and ethical travel accessories'
  },
  {
    name: 'Kiwitaxi',
    url: 'https://kiwitaxi.tpk.mx/NGL3ovB3',
    logo: '/affiliates/kiwitaxi-logo.svg',
    alt: 'Kiwitaxi - Airport transfer booking',
    description: 'Reliable airport transfer booking worldwide'
  },
  {
    name: 'Airalo',
    url: 'https://airalo.tpk.mx/M99krJZy',
    logo: '/affiliates/airalo-logo.svg',
    alt: 'Airalo - eSIM store for travelers',
    description: 'World\'s first eSIM store for international travelers'
  },
  {
    name: 'GetRentacar.com',
    url: 'https://getrentacar.tpk.mx/I3FuOWfB',
    logo: '/affiliates/getrentacar-logo.svg',
    alt: 'GetRentacar.com - Car rental platform',
    description: 'Global car rental platform with competitive prices'
  },
  {
    name: 'Surfshark VPN',
    url: 'https://get.surfshark.net/aff_c?offer_id=926&aff_id=39802',
    logo: '/affiliates/surfshark-vpn-logo.svg',
    alt: 'Surfshark VPN - Secure VPN service',
    description: 'Fast and secure VPN service for travelers'
  },
  {
    name: 'Surfshark One',
    url: 'https://get.surfshark.net/aff_c?offer_id=1249&aff_id=39802',
    logo: '/affiliates/surfshark-one-logo.svg',
    alt: 'Surfshark One - All-in-one privacy suite',
    description: 'Complete privacy and security suite'
  },
  {
    name: 'Wise',
    url: 'https://wise.com/invite/ihpc/rodneyowenp?utm_source=ios-pill-hp-copylink&utm_medium=invite&utm_campaign=&utm_content=&referralCode=rodneyowenp',
    logo: '/affiliates/wise-logo.svg',
    alt: 'Wise - International money transfers',
    description: 'Fast and low-cost international money transfers'
  },
  {
    name: 'AMEX Platinum',
    url: 'https://americanexpress.com/en-au/referral/platinum?ref=rODNEP5E1w&CPID=999999537',
    logo: '/affiliates/amex-platinum-logo.svg',
    alt: 'American Express Platinum Card - Premium credit card',
    description: 'Premium credit card with travel benefits and rewards'
  },
  {
    name: 'UP Card',
    url: 'https://hook.up.me/rodneyp',
    logo: '/affiliates/up-card-logo.svg',
    alt: 'UP Card - Smart banking and spending',
    description: 'Smart banking with spending insights and savings'
  }
];

// Fallback placeholder for missing logos
export const getAffiliateLogoFallback = (partnerName: string): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="120" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="60" fill="#f3f4f6"/>
      <text x="60" y="35" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6b7280">
        ${partnerName}
      </text>
    </svg>
  `)}`;
};

// Cache key for verification results
export const AFFILIATE_CACHE_KEY = 'affiliate_verification_cache';
export const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds