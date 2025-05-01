import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { JWT } from 'google-auth-library';

/**
 * Interface for analytics data
 */
export interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: string;
  bounceRate: string;
  topPages: Array<{
    path: string;
    pageViews: number;
    title?: string;
  }>;
  topSources: Array<{
    source: string;
    pageViews: number;
  }>;
  topCountries: Array<{
    country: string;
    pageViews: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    sessions: number;
    percentage: string;
  }>;
  trafficOverTime: Array<{
    date: string;
    pageViews: number;
    visitors: number;
  }>;
}

/**
 * Google Analytics service for fetching analytics data
 */
export class GoogleAnalyticsService {
  private client: BetaAnalyticsDataClient | null = null;
  private propertyId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '';
  }

  /**
   * Initialize the Google Analytics client
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Check if we have the required credentials
      if (
        !process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL ||
        !process.env.GOOGLE_ANALYTICS_PRIVATE_KEY ||
        !this.propertyId
      ) {
        throw new Error('Missing Google Analytics credentials');
      }

      // Create a JWT auth client
      const auth = new JWT({
        email: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
        key: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
      });

      // Create the analytics client
      this.client = new BetaAnalyticsDataClient({ auth });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Google Analytics client:', error);
      throw error;
    }
  }

  /**
   * Get analytics data for the specified date range
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Analytics data
   */
  async getAnalyticsData(
    startDate: string = '7daysAgo',
    endDate: string = 'today'
  ): Promise<AnalyticsData> {
    try {
      await this.initialize();

      if (!this.client) {
        throw new Error('Google Analytics client not initialized');
      }

      // Get page views and visitors
      const [pageViewsResponse] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'totalUsers' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
      });

      // Get top pages
      const [topPagesResponse] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' },
        ],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      });

      // Get top sources
      const [topSourcesResponse] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 5,
      });

      // Get top countries
      const [topCountriesResponse] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 5,
      });

      // Get device breakdown
      const [deviceBreakdownResponse] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      });

      // Get traffic over time
      const [trafficOverTimeResponse] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'totalUsers' },
        ],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      });

      // Parse the responses
      const pageViews = parseInt(pageViewsResponse.rows?.[0]?.metricValues?.[0]?.value || '0');
      const uniqueVisitors = parseInt(pageViewsResponse.rows?.[0]?.metricValues?.[1]?.value || '0');
      const averageSessionDuration = this.formatDuration(parseFloat(pageViewsResponse.rows?.[0]?.metricValues?.[2]?.value || '0'));
      const bounceRate = this.formatPercentage(parseFloat(pageViewsResponse.rows?.[0]?.metricValues?.[3]?.value || '0'));

      const topPages = topPagesResponse.rows?.map(row => ({
        path: row.dimensionValues?.[0]?.value || '',
        title: row.dimensionValues?.[1]?.value || '',
        pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
      })) || [];

      const topSources = topSourcesResponse.rows?.map(row => ({
        source: row.dimensionValues?.[0]?.value || '(direct)',
        pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
      })) || [];

      const topCountries = topCountriesResponse.rows?.map(row => ({
        country: row.dimensionValues?.[0]?.value || 'Unknown',
        pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
      })) || [];

      // Calculate total sessions for percentage
      const totalSessions = deviceBreakdownResponse.rows?.reduce(
        (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'),
        0
      ) || 0;

      const deviceBreakdown = deviceBreakdownResponse.rows?.map(row => {
        const sessions = parseInt(row.metricValues?.[0]?.value || '0');
        const percentage = totalSessions > 0 ? (sessions / totalSessions) * 100 : 0;
        
        return {
          device: row.dimensionValues?.[0]?.value || 'Unknown',
          sessions,
          percentage: this.formatPercentage(percentage),
        };
      }) || [];

      const trafficOverTime = trafficOverTimeResponse.rows?.map(row => ({
        date: this.formatDate(row.dimensionValues?.[0]?.value || ''),
        pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
        visitors: parseInt(row.metricValues?.[1]?.value || '0'),
      })) || [];

      return {
        pageViews,
        uniqueVisitors,
        averageSessionDuration,
        bounceRate,
        topPages,
        topSources,
        topCountries,
        deviceBreakdown,
        trafficOverTime,
      };
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      
      // Return mock data for development or when GA is not available
      return this.getMockAnalyticsData();
    }
  }

  /**
   * Format a duration in seconds to a human-readable string
   * @param seconds - Duration in seconds
   * @returns Formatted duration string
   * @private
   */
  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Format a percentage value
   * @param value - Percentage value
   * @returns Formatted percentage string
   * @private
   */
  private formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  /**
   * Format a date string from YYYYMMDD to YYYY-MM-DD
   * @param dateString - Date string in YYYYMMDD format
   * @returns Formatted date string
   * @private
   */
  private formatDate(dateString: string): string {
    if (dateString.length !== 8) {
      return dateString;
    }
    
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    
    return `${year}-${month}-${day}`;
  }

  /**
   * Get mock analytics data for development or when GA is not available
   * @returns Mock analytics data
   * @private
   */
  private getMockAnalyticsData(): AnalyticsData {
    return {
      pageViews: 12345,
      uniqueVisitors: 5678,
      averageSessionDuration: '2m 45s',
      bounceRate: '45.67%',
      topPages: [
        { path: '/', pageViews: 3456, title: 'Home - Global Travel Report' },
        { path: '/stories/exploring-kyoto', pageViews: 1234, title: 'Exploring the Hidden Temples of Kyoto' },
        { path: '/stories/safari-adventure', pageViews: 987, title: 'Safari Adventure in Tanzania' },
        { path: '/categories/cruises', pageViews: 876, title: 'Cruise Stories - Global Travel Report' },
        { path: '/stories/mediterranean-cruise-guide', pageViews: 765, title: 'Mediterranean Cruise Guide' },
      ],
      topSources: [
        { source: 'google', pageViews: 4567 },
        { source: '(direct)', pageViews: 2345 },
        { source: 'facebook.com', pageViews: 1234 },
        { source: 'twitter.com', pageViews: 987 },
        { source: 'instagram.com', pageViews: 654 },
      ],
      topCountries: [
        { country: 'Australia', pageViews: 5678 },
        { country: 'United States', pageViews: 2345 },
        { country: 'United Kingdom', pageViews: 1234 },
        { country: 'Canada', pageViews: 987 },
        { country: 'New Zealand', pageViews: 654 },
      ],
      deviceBreakdown: [
        { device: 'mobile', sessions: 4567, percentage: '56.78%' },
        { device: 'desktop', sessions: 2345, percentage: '29.12%' },
        { device: 'tablet', sessions: 1234, percentage: '14.10%' },
      ],
      trafficOverTime: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateString = date.toISOString().split('T')[0];
        
        return {
          date: dateString,
          pageViews: Math.floor(Math.random() * 1000) + 500,
          visitors: Math.floor(Math.random() * 500) + 200,
        };
      }),
    };
  }
}
