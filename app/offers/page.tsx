import React from 'react';
import { Metadata } from 'next';
import { AdSenseLeaderboard } from '@/src/components/ads/AdSense';
import { AffiliateService } from '@/src/services/affiliateService';
import { AffiliateSection } from '@/src/components/affiliates/AffiliateSection';
import { ClientSuspense } from '@/src/components/ui/ClientSuspense';

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
 */
function OffersPageContent() {
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
    </div>
  );
}

export default function OffersPage() {
  return (
    <ClientSuspense>
      <OffersPageContent />
    </ClientSuspense>
  );
}
