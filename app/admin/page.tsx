'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PerformanceMonitor } from '@/src/components/admin/PerformanceMonitor';
import { ClientSuspense } from '@/src/components/ui/ClientSuspense';
import { SafeSearchParamsProvider } from '@/src/components/ui/SearchParamsProvider';

interface Stats {
  totalStories: number;
  cruiseStories: number;
  otherStories: number;
  lastPublished: string | null;
}

function AdminDashboardContent() {
  const [stats, setStats] = useState<Stats>({
    totalStories: 0,
    cruiseStories: 0,
    otherStories: 0,
    lastPublished: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all stories to calculate stats
        const response = await fetch('/api/stories');

        if (!response.ok) {
          throw new Error('Failed to fetch stories');
        }

        const data = await response.json();

        if (data.success) {
          const stories = data.stories;
          const cruiseStories = stories.filter((story: any) =>
            story.category.toLowerCase().includes('cruise')
          );
          const otherStories = stories.filter((story: any) =>
            !story.category.toLowerCase().includes('cruise')
          );

          // Find the most recently published story
          let lastPublished = null;
          if (stories.length > 0) {
            const sortedStories = [...stories].sort((a: any, b: any) => {
              const dateA = new Date(a.publishedAt);
              const dateB = new Date(b.publishedAt);
              return dateB.getTime() - dateA.getTime();
            });

            lastPublished = sortedStories[0].publishedAt;
          }

          setStats({
            totalStories: stories.length,
            cruiseStories: cruiseStories.length,
            otherStories: otherStories.length,
            lastPublished,
          });
        } else {
          throw new Error(data.message || 'Failed to fetch stories');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';

    return new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const triggerContentGeneration = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the cron endpoint to trigger content generation
      const response = await fetch('/api/cron/dailyStories');

      if (!response.ok) {
        throw new Error('Failed to trigger content generation');
      }

      const data = await response.json();

      if (data.success) {
        alert('Content generation triggered successfully!');
        // Refresh stats after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(data.message || 'Failed to trigger content generation');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Stories</h2>
              <p className="text-3xl font-bold text-blue-600">{stats.totalStories}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Cruise Stories</h2>
              <p className="text-3xl font-bold text-blue-600">{stats.cruiseStories}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Other Stories</h2>
              <p className="text-3xl font-bold text-blue-600">{stats.otherStories}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Last Published</h2>
              <p className="text-xl font-medium text-blue-600">{formatDate(stats.lastPublished)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Content Generation</h2>
              <p className="text-gray-600 mb-4">
                Trigger the content generation process to create new stories. This will fetch content from RSS feeds,
                rewrite it using OpenAI, and add images from Unsplash.
              </p>
              <button
                onClick={triggerContentGeneration}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Generate New Content'}
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Manage Content</h2>
              <p className="text-gray-600 mb-4">
                View and manage all stories in the database. You can filter by category, view story details,
                and more.
              </p>
              <Link
                href="/admin/stories"
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors inline-block"
              >
                Manage Stories
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Analytics Dashboard</h2>
              <p className="text-gray-600 mb-4">
                View detailed analytics for your website. Track page views, visitors, traffic sources,
                and more to understand your audience.
              </p>
              <Link
                href="/admin/analytics"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors inline-block"
              >
                View Analytics
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Content Audit</h2>
              <p className="text-gray-600 mb-4">
                Analyze content freshness, quality, and SEO optimization. Identify outdated content and
                opportunities for improvement.
              </p>
              <Link
                href="/admin/content-audit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors inline-block"
              >
                Run Content Audit
              </Link>
            </div>
          </div>

          {/* Performance Monitoring */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Monitoring</h2>
            <PerformanceMonitor />
          </div>

          {/* Quick links */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 hover:underline"
                target="_blank"
              >
                View Website
              </Link>
              <Link
                href="/stories"
                className="text-blue-600 hover:text-blue-800 hover:underline"
                target="_blank"
              >
                All Stories
              </Link>
              <Link
                href="/categories/cruises"
                className="text-blue-600 hover:text-blue-800 hover:underline"
                target="_blank"
              >
                Cruise Stories
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <SafeSearchParamsProvider>
      <AdminDashboardContent />
    </SafeSearchParamsProvider>
  );
}
