'use client';

import { useState, useEffect } from 'react';
import { AnalyticsData } from '@/src/lib/analytics';
import { OverviewStats } from './OverviewStats';
import { TopPagesChart } from './TopPagesChart';
import { TrafficSourcesChart } from './TrafficSourcesChart';
import { GeographicDistribution } from './GeographicDistribution';
import { DeviceBreakdown } from './DeviceBreakdown';
import { TrafficOverTime } from './TrafficOverTime';
import { DateRangePicker } from './DateRangePicker';

/**
 * Analytics Dashboard component
 * @returns The analytics dashboard component
 */
export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '7daysAgo',
    endDate: 'today',
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  /**
   * Fetch analytics data from the API
   */
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create base64 encoded credentials
      const credentials = btoa(`${process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'}:${process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'password'}`);
      
      // Fetch analytics data from the API
      const response = await fetch(
        `/api/analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch analytics data');
      }

      setAnalyticsData(data.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle date range change
   * @param newDateRange - The new date range
   */
  const handleDateRangeChange = (newDateRange: { startDate: string; endDate: string }) => {
    setDateRange(newDateRange);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <DateRangePicker onChange={handleDateRangeChange} />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {loading && !analyticsData ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : analyticsData ? (
        <div className="space-y-6">
          <OverviewStats data={analyticsData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopPagesChart data={analyticsData.topPages} />
            <TrafficSourcesChart data={analyticsData.topSources} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GeographicDistribution data={analyticsData.topCountries} />
            <DeviceBreakdown data={analyticsData.deviceBreakdown} />
          </div>

          <TrafficOverTime data={analyticsData.trafficOverTime} />
        </div>
      ) : null}
    </div>
  );
}
