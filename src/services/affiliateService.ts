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
  // Saily eSIM Products
  {
    id: 'saily-global-esim',
    name: 'Global eSIM Data Plan',
    description: 'Stay connected in 190+ countries with affordable data plans and instant activation',
    imageUrl: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&q=80&w=2400',
    affiliateUrl: 'https://go.saily.site/aff_c?offer_id=101&aff_id=8736',
    provider: 'saily',
    category: 'Connectivity',
    tags: ['eSIM', 'Data', 'International', 'Travel Essentials', 'Global', 'Adventure', 'Budget', 'Family', 'Solo'],
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
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&q=80&w=2400',
    affiliateUrl: 'https://go.saily.site/aff_c?offer_id=101&aff_id=8736',
    provider: 'saily',
    category: 'Connectivity',
    tags: ['SIM Card', 'Europe', 'Data', 'Roaming', 'France', 'Italy', 'Spain', 'Germany', 'United Kingdom', 'Culture', 'Food & Wine'],
    price: '$39.99',
    discountPrice: '$24.99',
    discountPercentage: 37,
    rating: 4.7
  },
  {
    id: 'saily-asia-sim',
    name: 'Asia Travel SIM Card',
    description: 'Reliable data coverage across major Asian destinations including Japan, Thailand, and Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&q=80&w=2400',
    affiliateUrl: 'https://go.saily.site/aff_c?offer_id=101&aff_id=8736',
    provider: 'saily',
    category: 'Connectivity',
    tags: ['SIM Card', 'Asia', 'Data', 'Japan', 'Thailand', 'Singapore', 'China', 'Vietnam', 'Indonesia', 'Adventure', 'Culture'],
    price: '$34.99',
    discountPrice: '$22.99',
    discountPercentage: 34,
    rating: 4.6
  },
  {
    id: 'saily-oceania-sim',
    name: 'Australia & New Zealand SIM',
    description: 'Perfect for travelers exploring Australia and New Zealand with extensive coverage',
    imageUrl: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&q=80&w=2400',
    affiliateUrl: 'https://go.saily.site/aff_c?offer_id=101&aff_id=8736',
    provider: 'saily',
    category: 'Connectivity',
    tags: ['SIM Card', 'Oceania', 'Data', 'Australia', 'New Zealand', 'Adventure', 'Sustainable'],
    price: '$29.99',
    discountPrice: '$19.99',
    discountPercentage: 33,
    rating: 4.5
  },

  // Nord VPN Products
  {
    id: 'nordvpn-annual',
    name: 'Nord VPN Annual Plan',
    description: 'Stay secure while traveling with Nord VPN\'s annual subscription',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&q=80&w=2400',
    affiliateUrl: 'https://go.nordpass.io/aff_c?offer_id=488&aff_id=123038&url_id=9356',
    provider: 'nordvpn',
    category: 'Security',
    tags: ['VPN', 'Security', 'Privacy', 'Travel Essentials', 'Global', 'Adventure', 'Budget', 'Family', 'Solo', 'Business'],
    price: '$143.40',
    discountPrice: '$59.88',
    discountPercentage: 58,
    rating: 4.9,
    featured: true
  },
  {
    id: 'nordvpn-monthly',
    name: 'Nord VPN Monthly Plan',
    description: 'Flexible monthly protection for short-term travelers',
    imageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&q=80&w=2400',
    affiliateUrl: 'https://go.nordpass.io/aff_c?offer_id=488&aff_id=123038&url_id=9356',
    provider: 'nordvpn',
    category: 'Security',
    tags: ['VPN', 'Security', 'Privacy', 'Short Trip', 'Budget', 'Solo'],
    price: '$11.99',
    discountPrice: '$11.99',
    discountPercentage: 0,
    rating: 4.7
  },
  {
    id: 'nordvpn-family',
    name: 'Nord VPN Family Plan',
    description: 'Protect the whole family with multiple device coverage',
    imageUrl: 'https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?auto=format&q=80&w=2400',
    affiliateUrl: 'https://go.nordpass.io/aff_c?offer_id=488&aff_id=123038&url_id=9356',
    provider: 'nordvpn',
    category: 'Security',
    tags: ['VPN', 'Security', 'Privacy', 'Family', 'Multiple Devices'],
    price: '$179.99',
    discountPrice: '$89.99',
    discountPercentage: 50,
    rating: 4.8
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
   * Get affiliate products by tags with relevance scoring
   *
   * This method returns products that match the given tags, sorted by relevance score.
   * The relevance score is calculated based on how many tags match and their position in the list.
   *
   * @param tags - Array of tags to match against
   * @param limit - Maximum number of products to return
   * @returns Array of affiliate products sorted by relevance
   */
  public getProductsByTags(tags: string[]): AffiliateProduct[] {
    if (!tags || tags.length === 0) {
      return this.getFeaturedProducts();
    }

    const normalizedTags = tags.map(tag => tag.toLowerCase());
    const allProducts = this.getAllProducts();

    // Calculate relevance score for each product
    const scoredProducts = allProducts.map(product => {
      let score = 0;
      const productTags = product.tags.map(tag => tag.toLowerCase());

      // Calculate score based on tag matches
      normalizedTags.forEach((tag, index) => {
        // Tags earlier in the list are more important (category, country)
        const positionWeight = Math.max(1, 5 - index * 0.5);

        if (productTags.includes(tag)) {
          score += positionWeight;
        }

        // Partial matches (e.g., "Japan" in "Asia Japan")
        productTags.forEach(productTag => {
          if (productTag.includes(tag) || tag.includes(productTag)) {
            score += positionWeight * 0.5;
          }
        });
      });

      // Boost score for featured products
      if (product.featured) {
        score *= 1.2;
      }

      return { product, score };
    });

    // Filter products with a score > 0 and sort by score (descending)
    return scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
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
    * Track an affiliate link click with enhanced analytics
    */
  public trackClick(product: AffiliateProduct, source: string = 'website'): void {
    if (!this.trackingEnabled) return;

    const trackingData = {
      productId: product.id,
      provider: product.provider,
      source,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      referrer: typeof window !== 'undefined' ? window.document.referrer : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    // Send to analytics service
    this.sendToAnalytics('affiliate_click', trackingData);

    // Store in local storage for persistence
    this.storeClickData(trackingData);

    console.log(`Affiliate click tracked: ${product.id} from ${source}`);
  }

  /**
    * Send tracking data to analytics service
    */
  private sendToAnalytics(event: string, data: any): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: 'affiliate',
        event_label: data.productId,
        value: data.provider,
        custom_parameter: data.source,
      });
    }

    // Also send to our API for server-side tracking
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/affiliate-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch(error => {
        console.error('Failed to send affiliate tracking data:', error);
      });
    }
  }

  /**
    * Store click data locally for persistence
    */
  private storeClickData(data: any): void {
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
        existing.push(data);

        // Keep only last 100 clicks
        if (existing.length > 100) {
          existing.splice(0, existing.length - 100);
        }

        localStorage.setItem('affiliate_clicks', JSON.stringify(existing));
      } catch (error) {
        console.error('Failed to store affiliate click data:', error);
      }
    }
  }

  /**
    * Get affiliate click statistics
    */
  public getClickStats(): {
    totalClicks: number;
    clicksByProvider: Record<string, number>;
    recentClicks: any[];
  } {
    try {
      if (typeof window !== 'undefined') {
        const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');

        const clicksByProvider: Record<string, number> = {};
        clicks.forEach((click: any) => {
          clicksByProvider[click.provider] = (clicksByProvider[click.provider] || 0) + 1;
        });

        return {
          totalClicks: clicks.length,
          clicksByProvider,
          recentClicks: clicks.slice(-10), // Last 10 clicks
        };
      }
    } catch (error) {
      console.error('Failed to get affiliate click stats:', error);
    }

    return {
      totalClicks: 0,
      clicksByProvider: {},
      recentClicks: [],
    };
  }
}

export default AffiliateService;
