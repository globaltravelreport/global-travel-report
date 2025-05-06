import React from 'react';
import { Metadata } from 'next';
import { TuneOffersSection } from '@/src/components/affiliates/TuneOffersSection';
import { AdSenseLeaderboard } from '@/src/components/ads/AdSense';
import { AffiliateService } from '@/src/services/affiliateService';
import { AffiliateSection } from '@/src/components/affiliates/AffiliateSection';

// Generate metadata for the offers page
export const metadata: Metadata = {
  title: 'Travel Offers | Global Travel Report',
  description: 'Exclusive travel offers and deals recommended by the Global Travel Report team to help you plan your next adventure.',
};

/**
 * Travel Offers Page
 *
 * This page displays travel offers and deals from:
 * 1. Saily - International SIM cards and eSIMs
 * 2. Nord VPN - Travel security essentials
 * 3. TUNE affiliate network - Various travel deals
 */
export default function OffersPage() {
  // Get affiliate service instance
  const affiliateService = AffiliateService.getInstance();

  // Get products by provider
  const sailyProducts = affiliateService.getProductsByProvider('saily');
  const nordVpnProducts = affiliateService.getProductsByProvider('nordvpn');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Travel Offers</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Exclusive travel offers and deals recommended by our travel experts to help you plan your next adventure.
        </p>
      </div>

      {/* Featured Offers */}
      <TuneOffersSection
        title="Featured Travel Offers"
        description="Handpicked travel deals from our partners"
        source="offers-featured"
        layout="featured"
        featuredOnly={true}
        limit={4}
      />

      {/* International SIM Cards Section */}
      {sailyProducts.length > 0 && (
        <section className="my-16">
          <AffiliateSection
            title="International SIM Cards from Saily"
            description="Stay connected worldwide with affordable international SIM cards and eSIMs"
            products={sailyProducts}
            source="offers-saily"
            layout="grid"
            className="mb-16"
            limit={6}
          />
        </section>
      )}

      {/* Travel Security Section */}
      {nordVpnProducts.length > 0 && (
        <section className="my-16">
          <h2 className="text-3xl font-bold mb-6">Travel Security Essentials</h2>

          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">Why You Need a VPN When Traveling</h3>

            <div className="prose max-w-none mb-6">
              <p>
                When traveling, your online security and privacy are more vulnerable than ever.
                Public Wi-Fi networks in hotels, airports, and cafes are often unsecured, making
                your personal information an easy target for hackers.
              </p>

              <h4>A VPN Helps You:</h4>

              <ul>
                <li><strong>Secure your connection</strong> on public Wi-Fi networks</li>
                <li><strong>Access geo-restricted content</strong> from your home country</li>
                <li><strong>Protect your banking information</strong> when making transactions</li>
                <li><strong>Browse privately</strong> without being tracked</li>
                <li><strong>Avoid price discrimination</strong> when booking flights and hotels</li>
              </ul>

              <p>
                Nord VPN offers military-grade encryption, a strict no-logs policy, and servers in
                60+ countries, making it an essential tool for any traveler.
              </p>
            </div>

            {nordVpnProducts.map((product) => (
              <AffiliateSection
                key={product.id}
                products={[product]}
                source="offers-nordvpn"
                layout="featured"
                showTitle={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* AdSense Leaderboard */}
      <div className="my-12">
        <AdSenseLeaderboard />
      </div>

      {/* Cruise Offers */}
      <TuneOffersSection
        title="Cruise Deals"
        description="Discover amazing cruise deals to destinations around the world"
        source="offers-cruise"
        category="Cruise"
        limit={3}
      />

      {/* Hotel Offers */}
      <TuneOffersSection
        title="Hotel Deals"
        description="Find the perfect accommodation for your next trip"
        source="offers-hotel"
        tag="Hotel"
        limit={3}
      />

      {/* Flight Offers */}
      <TuneOffersSection
        title="Flight Deals"
        description="Save on flights to your favorite destinations"
        source="offers-flight"
        tag="Flight"
        limit={3}
      />

      {/* AdSense Leaderboard */}
      <div className="my-12">
        <AdSenseLeaderboard />
      </div>

      {/* Travel Insurance Offers */}
      <TuneOffersSection
        title="Travel Insurance"
        description="Protect your trip with comprehensive travel insurance"
        source="offers-insurance"
        tag="Insurance"
        limit={3}
      />

      {/* Travel Packages */}
      <TuneOffersSection
        title="Travel Packages"
        description="Complete travel packages for hassle-free adventures"
        source="offers-packages"
        tag="Package"
        limit={3}
      />
    </div>
  );
}
