import { Metadata } from 'next';
import { affiliatePartners } from '@/src/data/affiliatePartners';
import EnhancedOffersPageClient from './enhanced/EnhancedOffersPageClient';

export const metadata: Metadata = {
  title: 'Travel Deals & Offers - Global Travel Report',
  description: 'Compare trusted travel partners for accommodation, transfers, eSIMs, insurance, privacy, finance and practical trip planning offers.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/offers`,
  },
  openGraph: {
    title: 'Travel Deals & Offers - Global Travel Report',
    description: 'Compare trusted travel partners for accommodation, transfers, eSIMs, insurance, privacy, finance and practical trip planning offers.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/offers`,
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/og/facebook-home-20260509',
        width: 1200,
        height: 630,
        alt: 'Travel Deals and Offers - Global Travel Report',
      },
    ],
    type: 'website',
    locale: 'en_AU',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@GTravelReport',
    creator: '@GTravelReport',
    title: 'Travel Deals & Offers - Global Travel Report',
    description: 'Compare trusted travel partners for accommodation, transfers, eSIMs, insurance, privacy, finance and practical trip planning offers.',
    images: ['/og/facebook-home-20260509'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'travel',
  keywords: ['travel deals', 'travel offers', 'accommodation deals', 'airport transfers', 'travel esim', 'travel insurance', 'travel finance'],
};

export default function OffersPage() {
  // Group partners by category (using manual mapping since data doesn't include category)
  const categoryMapping: Record<string, string> = {
    'Trip.com': 'Accommodation',
    'Welcome Pickups': 'Transportation',
    'Yesim': 'Connectivity',
    'EKTA': 'Travel Essentials',
    'Kiwitaxi': 'Transportation',
    'Airalo': 'Connectivity',
    'GetRentacar.com': 'Transportation',
    'Surfshark VPN': 'Travel Essentials',
    'Surfshark One': 'Travel Essentials',
    'Wise': 'Finance',
    'AMEX Platinum': 'Finance',
    'UP Card': 'Finance'
  };

  const partnersByCategory = affiliatePartners.reduce((acc, partner) => {
    const category = categoryMapping[partner.name] || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(partner);
    return acc;
  }, {} as Record<string, typeof affiliatePartners>);

  // Promotions remain empty until their terms, expiry and verification date are
  // supplied by a maintained source. Partner links are still available below.
  const verifiedPromotionalOffers: Array<{
    id: string;
    title: string;
    description: string;
    partner: string;
    discount: string;
    validUntil: string;
    verifiedAt: string;
    termsUrl: string;
    featured: boolean;
  }> = [];

  return (
    <EnhancedOffersPageClient
      promotionalOffers={verifiedPromotionalOffers}
      partnersByCategory={partnersByCategory}
    />
  );
}
