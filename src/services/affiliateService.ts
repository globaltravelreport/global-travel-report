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
    name: 'Saily.com',
    baseUrl: 'https://www.saily.com',
    affiliateId: process.env.SAILY_AFFILIATE_ID || '',
    logoUrl: '/images/affiliates/saily-logo.png',
    description: 'Find the best cruise deals and travel packages'
  },
  nordvpn: {
    id: 'nordvpn',
    name: 'Nord VPN',
    baseUrl: 'https://nordvpn.com',
    affiliateId: process.env.NORDVPN_AFFILIATE_ID || '',
    logoUrl: '/images/affiliates/nordvpn-logo.png',
    description: 'Secure your internet connection while traveling'
  }
};

// Sample affiliate products (to be replaced with API data)
const SAMPLE_AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    id: 'saily-caribbean-cruise',
    name: '7-Day Caribbean Cruise',
    description: 'Explore the beautiful Caribbean islands with this amazing cruise deal',
    imageUrl: 'https://images.unsplash.com/photo-1548574505-5e239809ee19',
    affiliateUrl: 'https://www.saily.com/deals/caribbean-cruise',
    provider: 'saily',
    category: 'Cruise',
    tags: ['Caribbean', 'Cruise', 'Beach', 'Island'],
    price: '$1,299',
    discountPrice: '$899',
    discountPercentage: 30,
    rating: 4.8,
    featured: true
  },
  {
    id: 'saily-mediterranean-cruise',
    name: 'Mediterranean Adventure',
    description: 'Discover the Mediterranean with stops in Italy, Greece, and Spain',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401',
    affiliateUrl: 'https://www.saily.com/deals/mediterranean-cruise',
    provider: 'saily',
    category: 'Cruise',
    tags: ['Mediterranean', 'Cruise', 'Europe', 'Culture'],
    price: '$1,599',
    discountPrice: '$1,199',
    discountPercentage: 25,
    rating: 4.7
  },
  {
    id: 'nordvpn-annual',
    name: 'Nord VPN Annual Plan',
    description: 'Stay secure while traveling with Nord VPN\'s annual subscription',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3',
    affiliateUrl: 'https://nordvpn.com/special-deal',
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
    const provider = this.getProvider(product.provider);
    if (!provider) return product.affiliateUrl;

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
