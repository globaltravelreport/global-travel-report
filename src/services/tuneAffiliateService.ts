/**
 * TUNE Affiliate Service
 * 
 * This service manages interactions with the TUNE Affiliate API for the Global Travel Report.
 * It handles fetching offers, generating tracking links, and tracking conversions.
 */

import axios from 'axios';

// Types for TUNE affiliate offers
export interface TuneOffer {
  id: string;
  name: string;
  description: string;
  default_payout: string;
  payout_type: string;
  preview_url: string;
  status: string;
  expiration_date: string;
  featured: boolean;
  require_approval: boolean;
  currency: string;
  thumbnail_url?: string;
  category?: string;
  countries?: string[];
  tags?: string[];
}

// Types for TUNE tracking links
export interface TuneTrackingLink {
  offer_id: string;
  tracking_url: string;
  tiny_url?: string;
  impression_pixel?: string;
}

// Configuration interface
interface TuneConfig {
  networkId: string;
  apiKey: string;
  baseUrl: string;
}

/**
 * TuneAffiliateService class for managing TUNE affiliate offers and tracking links
 */
export class TuneAffiliateService {
  private static instance: TuneAffiliateService;
  private config: TuneConfig;
  private cachedOffers: TuneOffer[] = [];
  private lastFetchTime: number = 0;
  private cacheExpiryTime: number = 3600000; // 1 hour in milliseconds

  private constructor() {
    this.config = {
      networkId: process.env.TUNE_NETWORK_ID || '',
      apiKey: process.env.TUNE_API_KEY || '',
      baseUrl: `https://${process.env.TUNE_NETWORK_ID || ''}.api.hasoffers.com/Apiv3/json`
    };
  }

  /**
   * Get the singleton instance of TuneAffiliateService
   */
  public static getInstance(): TuneAffiliateService {
    if (!TuneAffiliateService.instance) {
      TuneAffiliateService.instance = new TuneAffiliateService();
    }
    return TuneAffiliateService.instance;
  }

  /**
   * Check if the service is properly configured
   */
  public isConfigured(): boolean {
    return Boolean(this.config.networkId && this.config.apiKey);
  }

  /**
   * Get all available offers
   */
  public async getAllOffers(): Promise<TuneOffer[]> {
    // Check if we have cached offers that are still valid
    const now = Date.now();
    if (this.cachedOffers.length > 0 && now - this.lastFetchTime < this.cacheExpiryTime) {
      return this.cachedOffers;
    }

    try {
      const response = await axios.get(this.config.baseUrl, {
        params: {
          NetworkId: this.config.networkId,
          Target: 'Affiliate_Offer',
          Method: 'findAll',
          api_key: this.config.apiKey,
          fields: ['id', 'name', 'description', 'default_payout', 'payout_type', 'preview_url', 
                  'status', 'expiration_date', 'featured', 'require_approval', 'currency'],
          filters: {
            status: 'active'
          },
          sort: {
            featured: 'desc',
            name: 'asc'
          },
          contain: ['Thumbnail', 'OfferCategory', 'Country', 'OfferTag']
        }
      });

      if (response.data?.response?.status === 1 && response.data?.response?.data) {
        // Transform the API response into our TuneOffer format
        const offers: TuneOffer[] = Object.values(response.data.response.data).map((offer: any) => {
          // Extract thumbnail URL if available
          let thumbnailUrl = '';
          if (offer.Thumbnail && offer.Thumbnail.data) {
            const thumbnailData = Object.values(offer.Thumbnail.data)[0] as any;
            if (thumbnailData && thumbnailData.thumbnail_url) {
              thumbnailUrl = thumbnailData.thumbnail_url;
            }
          }

          // Extract category if available
          let category = '';
          if (offer.OfferCategory && offer.OfferCategory.data) {
            const categoryData = Object.values(offer.OfferCategory.data)[0] as any;
            if (categoryData && categoryData.name) {
              category = categoryData.name;
            }
          }

          // Extract countries if available
          const countries: string[] = [];
          if (offer.Country && offer.Country.data) {
            Object.values(offer.Country.data).forEach((country: any) => {
              if (country.name) {
                countries.push(country.name);
              }
            });
          }

          // Extract tags if available
          const tags: string[] = [];
          if (offer.OfferTag && offer.OfferTag.data) {
            Object.values(offer.OfferTag.data).forEach((tag: any) => {
              if (tag.name) {
                tags.push(tag.name);
              }
            });
          }

          return {
            id: offer.id,
            name: offer.name,
            description: offer.description || '',
            default_payout: offer.default_payout || '0.00',
            payout_type: offer.payout_type || 'cpa_flat',
            preview_url: offer.preview_url || '',
            status: offer.status,
            expiration_date: offer.expiration_date || '',
            featured: offer.featured !== '0000-00-00 00:00:00',
            require_approval: offer.require_approval === '1',
            currency: offer.currency || 'USD',
            thumbnail_url: thumbnailUrl,
            category: category,
            countries: countries,
            tags: tags
          };
        });

        // Cache the offers
        this.cachedOffers = offers;
        this.lastFetchTime = now;

        return offers;
      }

      return [];
    } catch (error) {
      console.error('Error fetching TUNE offers:', error);
      return [];
    }
  }

  /**
   * Get offers by category
   */
  public async getOffersByCategory(category: string): Promise<TuneOffer[]> {
    const allOffers = await this.getAllOffers();
    return allOffers.filter(offer => 
      offer.category?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get offers by tag
   */
  public async getOffersByTag(tag: string): Promise<TuneOffer[]> {
    const allOffers = await this.getAllOffers();
    return allOffers.filter(offer => 
      offer.tags?.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  /**
   * Get featured offers
   */
  public async getFeaturedOffers(limit: number = 5): Promise<TuneOffer[]> {
    const allOffers = await this.getAllOffers();
    return allOffers
      .filter(offer => offer.featured)
      .slice(0, limit);
  }

  /**
   * Generate a tracking link for an offer
   */
  public async generateTrackingLink(offerId: string, params: Record<string, string> = {}): Promise<TuneTrackingLink | null> {
    try {
      const response = await axios.get(this.config.baseUrl, {
        params: {
          NetworkId: this.config.networkId,
          Target: 'Affiliate_Offer',
          Method: 'generateTrackingLink',
          api_key: this.config.apiKey,
          offer_id: offerId,
          params: params,
          options: {
            tiny_url: true
          }
        }
      });

      if (response.data?.response?.status === 1 && response.data?.response?.data) {
        const data = response.data.response.data;
        return {
          offer_id: offerId,
          tracking_url: data.click_url || '',
          tiny_url: data.tiny_url || '',
          impression_pixel: data.impression_pixel || ''
        };
      }

      return null;
    } catch (error) {
      console.error(`Error generating tracking link for offer ${offerId}:`, error);
      return null;
    }
  }

  /**
   * Track a click on an offer
   */
  public trackClick(offerId: string, source: string = 'website'): void {
    // In a real implementation, this would send data to an analytics service
    console.log(`TUNE offer click tracked: ${offerId} from ${source}`);
    
    // Example of sending to a tracking endpoint
    if (typeof window !== 'undefined') {
      const trackingData = {
        offerId,
        source,
        timestamp: new Date().toISOString()
      };
      
      // This would be replaced with a real tracking implementation
      console.log('TUNE tracking data:', trackingData);
    }
  }
}

export default TuneAffiliateService;
