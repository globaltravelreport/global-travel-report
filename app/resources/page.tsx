import React from 'react';
import { Metadata } from 'next';
import { AffiliateService } from '@/src/services/affiliateService';
import { AffiliateSection } from '@/src/components/affiliates/AffiliateSection';
import { AffiliateBanner } from '@/src/components/affiliates/AffiliateBanner';
import { TuneOffersSection } from '@/src/components/affiliates/TuneOffersSection';

// Generate metadata for the resources page
export const metadata: Metadata = {
  title: 'Travel Resources | Global Travel Report',
  description: 'Essential travel resources, tools, and services recommended by the Global Travel Report team to help you plan your next adventure.',
};

/**
 * Travel Resources Page
 *
 * This page displays recommended travel resources, tools, and services
 * including affiliate products from Saily.com and Nord VPN.
 */
export default function ResourcesPage() {
  // Get affiliate service instance
  const affiliateService = AffiliateService.getInstance();

  // Get all affiliate products
  const allProducts = affiliateService.getAllProducts();

  // Get products by provider
  const sailyProducts = affiliateService.getProductsByProvider('saily');
  const nordVpnProducts = affiliateService.getProductsByProvider('nordvpn');

  // Get featured products
  const featuredProducts = affiliateService.getFeaturedProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Travel Resources</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Essential tools, services, and resources recommended by our travel experts to help you plan your next adventure.
        </p>
      </div>

      {/* Featured Resources */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Featured Resources</h2>
        <div className="space-y-8">
          {featuredProducts.map((product) => (
            <AffiliateBanner
              key={product.id}
              product={product}
              source="resources-featured"
              variant="horizontal"
            />
          ))}
        </div>
      </section>

      {/* International SIM Cards Section */}
      {sailyProducts.length > 0 && (
        <AffiliateSection
          title="International SIM Cards from Saily.com"
          description="Stay connected worldwide with affordable international SIM cards and eSIMs"
          products={sailyProducts}
          source="resources-saily"
          layout="grid"
          className="mb-16"
          limit={6}
        />
      )}

      {/* Travel Security Section */}
      {nordVpnProducts.length > 0 && (
        <section className="mb-16">
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
              <AffiliateBanner
                key={product.id}
                product={product}
                source="resources-nordvpn"
                variant="horizontal"
                buttonText="Get Protected Now"
              />
            ))}
          </div>
        </section>
      )}

      {/* TUNE Travel Offers Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Exclusive Travel Offers</h2>

        {/* Client-side component that fetches and displays TUNE offers */}
        <TuneOffersSection
          title="Featured Travel Deals"
          description="Handpicked travel deals from our trusted partners"
          source="resources-tune"
          layout="featured"
          featuredOnly={true}
          limit={4}
          className="mb-8"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Cruise Offers */}
          <TuneOffersSection
            title="Cruise Deals"
            description="Discover amazing cruise deals"
            source="resources-tune-cruise"
            category="Cruise"
            limit={2}
            showViewAll={true}
            viewAllLink="/offers"
          />

          {/* Hotel Offers */}
          <TuneOffersSection
            title="Hotel Deals"
            description="Find the perfect accommodation"
            source="resources-tune-hotel"
            tag="Hotel"
            limit={2}
            showViewAll={true}
            viewAllLink="/offers"
          />
        </div>
      </section>

      {/* Additional Resources */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">More Travel Resources</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Travel Insurance */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-3">Travel Insurance</h3>
            <p className="text-gray-600 mb-4">
              Protect your trip with comprehensive travel insurance coverage for medical emergencies,
              trip cancellations, and lost luggage.
            </p>
            <a
              href="https://www.worldnomads.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Learn more →
            </a>
          </div>

          {/* Flight Deals */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-3">Flight Deals</h3>
            <p className="text-gray-600 mb-4">
              Find the best flight deals with flexible search options, price alerts, and
              fare comparison tools.
            </p>
            <a
              href="https://www.skyscanner.com.au"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Learn more →
            </a>
          </div>

          {/* Accommodation */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-3">Accommodation</h3>
            <p className="text-gray-600 mb-4">
              Book hotels, hostels, apartments, and unique stays around the world with
              verified reviews and flexible cancellation options.
            </p>
            <a
              href="https://www.booking.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Learn more →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
