/**
 * Server-side Google Analytics service for fetching analytics data
 */
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export class GoogleAnalyticsService {
  private client: BetaAnalyticsDataClient | null = null;

  constructor() {
    if (process.env.GA_SERVICE_ACCOUNT_KEY && process.env.GA_PROPERTY_ID) {
      try {
        const credentials = JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY);
        this.client = new BetaAnalyticsDataClient({
          credentials,
        });
      } catch (error) {
        console.error('Failed to initialize Google Analytics client:', error);
      }
    }
  }

  async getAnalyticsData(startDate: string, endDate: string) {
    if (!this.client || !process.env.GA_PROPERTY_ID) {
      throw new Error('Google Analytics client not initialized');
    }

    const propertyId = `properties/${process.env.GA_PROPERTY_ID}`;

    const [response] = await this.client.runReport({
      property: propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'date' },
        { name: 'pagePath' },
        { name: 'pageTitle' },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [
        {
          dimension: {
            dimensionName: 'date',
          },
          desc: true,
        },
      ],
      limit: 1000,
    });

    return {
      rows: response.rows?.map(row => ({
        date: row.dimensionValues?.[0]?.value,
        pagePath: row.dimensionValues?.[1]?.value,
        pageTitle: row.dimensionValues?.[2]?.value,
        activeUsers: parseInt(row.metricValues?.[0]?.value || '0'),
        screenPageViews: parseInt(row.metricValues?.[1]?.value || '0'),
        sessions: parseInt(row.metricValues?.[2]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[3]?.value || '0'),
        averageSessionDuration: parseFloat(row.metricValues?.[4]?.value || '0'),
      })) || [],
      totals: {
        activeUsers: response.totals?.[0]?.metricValues?.[0]?.value,
        screenPageViews: response.totals?.[0]?.metricValues?.[1]?.value,
        sessions: response.totals?.[0]?.metricValues?.[2]?.value,
        bounceRate: response.totals?.[0]?.metricValues?.[3]?.value,
        averageSessionDuration: response.totals?.[0]?.metricValues?.[4]?.value,
      },
    };
  }
}