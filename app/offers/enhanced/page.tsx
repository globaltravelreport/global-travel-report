import { Metadata } from 'next';
import { affiliatePartners } from '@/src/data/affiliatePartners';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AffiliateDisclosure } from '@/src/components/legal/AffiliateDisclosure';
import { createTrackedAffiliateLink, getCurrentPageContext } from '@/src/lib/enhancedAffiliateTracking';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Travel Deals & Offers - Global Travel Report',
  description: 'Discover exclusive travel deals and offers from our trusted partners. Save on hotels, flights, transfers, and travel essentials.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/offers/enhanced`,
  },
  openGraph: {
    title: 'Travel Deals & Offers - Global Travel Report',
    description: 'Discover exclusive travel deals and offers from our trusted partners. Save on hotels, flights, transfers, and travel essentials.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/offers/enhanced`,
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/og/offers-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Travel Deals and Offers',
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
    description: 'Discover exclusive travel deals and offers from our trusted partners.',
    images: ['/og/offers-1200x630.jpg'],
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
  keywords: ['travel deals', 'travel offers', 'discounts', 'travel savings', 'affiliate deals'],
};

export default function EnhancedOffersPage() {
  const context = getCurrentPageContext();

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

  // Sample promotional offers (in production, this would come from an API)
  const promotionalOffers = [
    {
      id: 'welcome-bonus',
      title: 'New Customer Welcome Bonus',
      description: 'Get 10% off your first booking with Trip.com',
      partner: 'Trip.com',
      discount: '10% OFF',
      validUntil: '2024-12-31',
      featured: true
    },
    {
      id: 'airport-transfer',
      title: 'Airport Transfer Discount',
      description: 'Save 15% on airport transfers with Welcome Pickups',
      partner: 'Welcome Pickups',
      discount: '15% OFF',
      validUntil: '2024-12-31',
      featured: true
    },
    {
      id: 'esim-data',
      title: 'Global Data Plans',
      description: 'Unlimited data in 200+ countries starting at $4.50',
      partner: 'Airalo',
      discount: 'FROM $4.50',
      validUntil: '2024-12-31',
      featured: false
    },
    {
      id: 'vpn-security',
      title: 'Travel Security Suite',
      description: 'Complete online protection for travelers',
      partner: 'Surfshark VPN',
      discount: 'SPECIAL OFFER',
      validUntil: '2024-12-31',
      featured: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Exclusive Travel Deals & Offers
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Save on your next adventure with our handpicked selection of travel deals from trusted partners
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm">Travel Deals</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm">Trusted Partners</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Disclosure */}
      <section className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AffiliateDisclosure variant="banner" />
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Deals</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't miss these limited-time offers from our top travel partners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {promotionalOffers.filter(offer => offer.featured).map((offer) => {
              const partner = affiliatePartners.find(p => p.name === offer.partner);
              if (!partner) return null;

              const trackedLink = createTrackedAffiliateLink(
                partner.name.toLowerCase().replace(/\s+/g, '-'),
                partner.url,
                { ...context, section: 'featured_deals' }
              );

              return (
                <Card key={offer.id} className="relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-100 text-red-800">🔥 HOT DEAL</Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{offer.title}</CardTitle>
                      <Badge variant="outline" className="text-lg font-bold text-green-600">
                        {offer.discount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{offer.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                          <Image
                            src={partner.logo}
                            alt={`${partner.name} logo`}
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          <p className="text-sm text-gray-500">Valid until {offer.validUntil}</p>
                        </div>
                      </div>
                      <a
                        href={trackedLink.url}
                        onClick={trackedLink.onClick}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Claim Deal
                      </a>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect travel services and deals for your needs
            </p>
          </div>

          {Object.entries(partnersByCategory).map(([category, partners]) => (
            <div key={category} className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner) => {
                  const trackedLink = createTrackedAffiliateLink(
                    partner.name.toLowerCase().replace(/\s+/g, '-'),
                    partner.url,
                    { ...context, section: category.toLowerCase() }
                  );

                  return (
                    <Card key={partner.name} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16">
                            <Image
                              src={partner.logo}
                              alt={`${partner.name} logo`}
                              fill
                              className="object-contain"
                              sizes="64px"
                            />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{partner.name}</CardTitle>
                            <Badge variant="outline">{category}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4">{partner.description}</p>
                        <a
                          href={trackedLink.url}
                          onClick={trackedLink.onClick}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-lg transition-colors"
                        >
                          Visit {partner.name}
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Never Miss a Deal
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Subscribe to our newsletter and be the first to know about exclusive travel deals and offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}