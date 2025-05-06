/**
 * Affiliate Service
 *
 * This service manages affiliate links, tracking, and reporting for the Global Travel Report.
 * It handles UTM parameters, affiliate IDs, and tracking for various affiliate programs.
 */

import { v4 as uuidv4 } from 'uuid';

// Types for affiliate products
export interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  provider: string;
  category: string;
  tags: string[];
  price?: string;
  discountPrice?: string;
  discountPercentage?: number;
  rating?: number;
  featured?: boolean;
}

// Types for affiliate providers
export interface AffiliateProvider {
  id: string;
  name: string;
  baseUrl: string;
  affiliateId: string;
  logoUrl: string;
  description: string;
}

// Affiliate providers configuration
const AFFILIATE_PROVIDERS: Record<string, AffiliateProvider> = {
  saily: {
    id: 'saily',
    name: 'Saily',
    baseUrl: 'https://go.saily.site/aff_c?offer_id=101&aff_id=8736',
    affiliateId: '',
    logoUrl: '/images/affiliates/saily-logo.png',
    description: 'Stay connected worldwide with affordable international SIM cards and eSIMs'
  },
  nordvpn: {
    id: 'nordvpn',
    name: 'Nord VPN',
    baseUrl: 'https://go.nordpass.io/aff_c?offer_id=488&aff_id=123038&url_id=9356',
    affiliateId: '',
    logoUrl: '/images/affiliates/nordvpn-logo.png',
    description: 'Secure your internet connection while traveling'
  }
};

// Sample affiliate products (to be replaced with API data)
const SAMPLE_AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    id: 'saily-global-esim',
    name: 'Global eSIM Data Plan',
    description: 'Stay connected in 190+ countries with affordable data plans and instant activation',
    imageUrl: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb',
    affiliateUrl: 'https://go.saily.site/aff_c?offer_id=101&aff_id=8736',
    provider: 'saily',
    category: 'Connectivity',
    tags: ['eSIM', 'Data', 'International', 'Travel Essentials'],
    price: '$49.99',
    discountPrice: '$29.99',
    discountPercentage: 40,
    rating: 4.8,
    featured: true
  },
  {
    id: 'saily-europe-sim',
    name: 'Europe Travel SIM Card',
    description: 'Unlimited data across 30+ European countries with no roaming charges',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
    affiliateUrl: 'https://go.saily.site/aff_c?offer_id=101&aff_id=8736',
    provider: 'saily',
    category: 'Connectivity',
    tags: ['SIM Card', 'Europe', 'Data', 'Roaming'],
    price: '$39.99',
    discountPrice: '$24.99',
    discountPercentage: 37,
    rating: 4.7
  },
  {
    id: 'nordvpn-annual',
    name: 'Nord VPN Annual Plan',
    description: 'Stay secure while traveling with Nord VPN\'s annual subscription',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3',
    affiliateUrl: 'https://go.nordpass.io/aff_c?offer_id=488&aff_id=123038&url_id=9356',
    provider: 'nordvpn',
    category: 'Security',
    tags: ['VPN', 'Security', 'Privacy', 'Travel Essentials'],
    price: '$143.40',
    discountPrice: '$59.88',
    discountPercentage: 58,
    rating: 4.9,
    featured: true
  }
];

/**
 * AffiliateService class for managing affiliate links and products
 */
export class AffiliateService {
  private static instance: AffiliateService;
  private trackingEnabled: boolean;

  private constructor() {
    this.trackingEnabled = process.env.NEXT_PUBLIC_ENABLE_AFFILIATE_TRACKING === 'true';
  }

  /**
   * Get the singleton instance of AffiliateService
   */
  public static getInstance(): AffiliateService {
    if (!AffiliateService.instance) {
      AffiliateService.instance = new AffiliateService();
    }
    return AffiliateService.instance;
  }

  /**
   * Get all affiliate products
   */
  public getAllProducts(): AffiliateProduct[] {
    // In a real implementation, this would fetch from an API or database
    return SAMPLE_AFFILIATE_PRODUCTS;
  }

  /**
   * Get affiliate products by provider
   */
  public getProductsByProvider(providerId: string): AffiliateProduct[] {
    return this.getAllProducts().filter(product => product.provider === providerId);
  }

  /**
   * Get affiliate products by category
   */
  public getProductsByCategory(category: string): AffiliateProduct[] {
    return this.getAllProducts().filter(product =>
      product.category.toLowerCase() === category.toLowerCase() ||
      product.tags.some(tag => tag.toLowerCase() === category.toLowerCase())
    );
  }

  /**
   * Get affiliate products by tags
   */
  public getProductsByTags(tags: string[]): AffiliateProduct[] {
    const normalizedTags = tags.map(tag => tag.toLowerCase());
    return this.getAllProducts().filter(product =>
      product.tags.some(tag => normalizedTags.includes(tag.toLowerCase()))
    );
  }

  /**
   * Get featured affiliate products
   */
  public getFeaturedProducts(limit: number = 3): AffiliateProduct[] {
    return this.getAllProducts()
      .filter(product => product.featured)
      .slice(0, limit);
  }

  /**
   * Get an affiliate provider by ID
   */
  public getProvider(providerId: string): AffiliateProvider | undefined {
    return AFFILIATE_PROVIDERS[providerId];
  }

  /**
   * Generate an affiliate link with tracking parameters
   */
  public generateAffiliateLink(product: AffiliateProduct, source: string = 'website'): string {
    // For Saily and Nord VPN, we use the direct tracking links
    if (product.provider === 'saily' || product.provider === 'nordvpn') {
      return product.affiliateUrl;
    }

    const provider = this.getProvider(product.provider);
    if (!provider) return product.affiliateUrl;

    try {
      const url = new URL(product.affiliateUrl);

      // Add affiliate ID
      if (provider.affiliateId) {
        url.searchParams.append('ref', provider.affiliateId);
      }

      // Add tracking parameters if enabled
      if (this.trackingEnabled) {
        const trackingId = uuidv4().substring(0, 8);
        url.searchParams.append('utm_source', 'globaltravelreport');
        url.searchParams.append('utm_medium', 'affiliate');
        url.searchParams.append('utm_campaign', source);
        url.searchParams.append('utm_content', product.id);
        url.searchParams.append('utm_term', trackingId);
      }

      return url.toString();
    } catch (error) {
      console.error('Error generating affiliate link:', error);
      return product.affiliateUrl;
    }
  }

  /**
   * Track an affiliate link click
   */
  public trackClick(product: AffiliateProduct, source: string = 'website'): void {
    if (!this.trackingEnabled) return;

    // In a real implementation, this would send data to an analytics service
    console.log(`Affiliate click tracked: ${product.id} from ${source}`);

    // Example of sending to a tracking endpoint
    if (typeof window !== 'undefined') {
      const trackingData = {
        productId: product.id,
        provider: product.provider,
        source,
        timestamp: new Date().toISOString()
      };

      // This would be replaced with a real tracking implementation
      console.log('Tracking data:', trackingData);
    }
  }
}

export default AffiliateService;
