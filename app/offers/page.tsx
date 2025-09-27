import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import OffersPageClient from './OffersPageClient';

// Interface for offer data
interface Offer {
  title: string;
  description: string;
  affiliate_url: string;
  price: string;
  currency: string;
  category: string;
  partner: string;
  partner_logo: string;
  validFrom: string;
  validUntil: string;
  lastUpdated: string;
  source: string;
}

interface PartnerOffers {
  partner: string;
  partnerKey: string;
  logo: string;
  baseUrl: string;
  offers: Offer[];
  lastUpdated: string;
  totalOffers: number;
}

// Get all offers from JSON files
async function getAllOffers(): Promise<PartnerOffers[]> {
  try {
    const offersDir = path.join(process.cwd(), 'content', 'offers');

    if (!fs.existsSync(offersDir)) {
      console.log('Offers directory not found, creating...');
      fs.mkdirSync(offersDir, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(offersDir).filter(file => file.endsWith('.json'));
    const offers: PartnerOffers[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(offersDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent) as PartnerOffers;
        offers.push(data);
      } catch (error) {
        console.error(`Error reading offer file ${file}:`, error);
      }
    }

    return offers.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  } catch (error) {
    console.error('Error loading offers:', error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Travel Deals & Offers - Global Travel Report',
  description: 'Discover exclusive travel deals and offers from our trusted partners. Save on hotels, flights, transfers, and travel essentials.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/offers`,
  },
  openGraph: {
    title: 'Travel Deals & Offers - Global Travel Report',
    description: 'Discover exclusive travel deals and offers from our trusted partners. Save on hotels, flights, transfers, and travel essentials.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/offers`,
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/og/home-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Travel Deals and Offers - Global Travel Report',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@globaltravelreport',
    creator: '@globaltravelreport',
    title: 'Travel Deals & Offers - Global Travel Report',
    description: 'Discover exclusive travel deals and offers from our trusted partners. Save on hotels, flights, transfers, and travel essentials.',
    images: ['/og/home-1200x630.jpg'],
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
  keywords: ['travel deals', 'travel offers', 'hotel deals', 'flight deals', 'travel discounts', 'travel savings'],
};

export default async function OffersPage() {
  const partnerOffers = await getAllOffers();

  return <OffersPageClient partnerOffers={partnerOffers} />;
}
