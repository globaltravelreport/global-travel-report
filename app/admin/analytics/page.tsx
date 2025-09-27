'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { SafeSearchParamsProvider } from '@/components/ui/SearchParamsProvider';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const DynamicCharts = dynamic(
  () => import('@/components/analytics/AnalyticsDashboard').then((mod) => mod.AnalyticsDashboard),
  { ssr: false, loading: () => <div className="h-80 animate-pulse rounded bg-gray-100" /> }
);

/**
 * Admin analytics page
 * @returns The admin analytics page component
 */
function AdminAnalyticsContent() {
  const [chartsRef, entry] = useIntersectionObserver<HTMLDivElement>({ rootMargin: '200px' });
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

      <div ref={chartsRef} className="bg-white p-6 rounded-lg shadow-md min-h-80">
        {entry?.isIntersecting ? <DynamicCharts /> : <div className="h-80 animate-pulse rounded bg-gray-100" />}
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
