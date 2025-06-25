'use client';

import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import Link from 'next/link';
import { SafeSearchParamsProvider } from '@/components/ui/SearchParamsProvider';

/**
 * Admin analytics page
 * @returns The admin analytics page component
 */
function AdminAnalyticsContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Link
          href="/admin"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
        >
          Back to Admin
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <SafeSearchParamsProvider>
      <AdminAnalyticsContent />
    </SafeSearchParamsProvider>
  );
}
