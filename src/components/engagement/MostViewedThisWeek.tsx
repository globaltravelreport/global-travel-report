/**
 * Most Viewed This Week Component
 *
 * Displays the most popular stories and trending destinations
 * based on user engagement and view analytics.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Story } from '@/types/Story';

interface MostViewedThisWeekProps {
  stories?: Story[];
  maxItems?: number;
  showThumbnails?: boolean;
  className?: string;
}

interface ViewStats {
  storyId: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export function MostViewedThisWeek({
  stories = [],
  maxItems = 5,
  showThumbnails = true,
  className = ''
}: MostViewedThisWeekProps) {
  const [viewStats, setViewStats] = useState<ViewStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading view statistics
    const loadViewStats = async () => {
      setLoading(true);

      // Mock view statistics - in production this would come from analytics API
      const mockStats: ViewStats[] = stories.slice(0, maxItems).map((story, index) => ({
        storyId: story.id,
        views: Math.floor(Math.random() * 1000) + 100,
        uniqueViews: Math.floor(Math.random() * 800) + 80,
        avgTimeOnPage: Math.floor(Math.random() * 300) + 60, // seconds
        bounceRate: Math.floor(Math.random() * 40) + 20 // percentage
      }));

      setTimeout(() => {
        setViewStats(mockStats);
        setLoading(false);
      }, 500);
    };

    if (stories.length > 0) {
      loadViewStats();
    }
  }, [stories, maxItems]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  if (loading) {
    return (
      <div className={`most-viewed-this-week ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(maxItems)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`most-viewed-this-week ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Most Viewed This Week</h3>
      </div>

      <div className="space-y-3">
        {stories.slice(0, maxItems).map((story, index) => {
          const stats = viewStats.find(s => s.storyId === story.id);
          if (!stats) return null;

          return (
            <Link
              key={story.id}
              href={`/stories/${story.slug}`}
              className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center mt-1">
                {index + 1}
              </div>

              {/* Thumbnail */}
              {showThumbnails && (
                <div className="flex-shrink-0">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-1">
                  {story.title}
                </h4>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {formatViews(stats.views)}
                  </span>

                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(stats.avgTimeOnPage)}
                  </span>

                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded">
                    {stats.bounceRate}% bounce
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{story.category}</span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-500">
                    {new Date(story.publishedAt || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/analytics/most-viewed"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          View all analytics
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default MostViewedThisWeek;