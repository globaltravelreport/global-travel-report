import { ContentAutomationService } from '@/src/services/contentAutomationService';
import { NewsletterService } from '@/src/services/newsletterService';
import { EngagementService } from '@/src/services/engagementService';
import { AffiliateService } from '@/src/services/affiliateService';

/**
 * Admin Dashboard
 *
 * Provides an overview of content ingestion, engagement metrics,
 * newsletter statistics, and affiliate performance.
 */
export default async function AdminDashboard() {
  const automationService = ContentAutomationService.getInstance();
  const newsletterService = NewsletterService.getInstance();
  const engagementService = EngagementService.getInstance();
  const affiliateService = AffiliateService.getInstance();

  // Get automation stats
  const automationStats = await automationService.getAutomationStats();

  // Get newsletter stats
  const newsletterStats = await newsletterService.getSubscriberStats();

  // Get trending stories
  const trendingStories = await engagementService.getTrendingStories(5);

  // Get affiliate stats
  const affiliateStats = affiliateService.getClickStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Global Travel Report</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Content Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Stories</p>
                <p className="text-2xl font-semibold text-gray-900">{automationStats.totalStories}</p>
              </div>
            </div>
          </div>

          {/* Newsletter Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Newsletter Subscribers</p>
                <p className="text-2xl font-semibold text-gray-900">{newsletterStats.active}</p>
              </div>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Engagement Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{newsletterStats.engagementRate}%</p>
              </div>
            </div>
          </div>

          {/* Affiliate Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Affiliate Clicks</p>
                <p className="text-2xl font-semibold text-gray-900">{affiliateStats.totalClicks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Automation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Automation</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stories This Week</span>
                <span className="text-sm font-medium text-gray-900">{automationStats.storiesThisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Quality Score</span>
                <span className="text-sm font-medium text-gray-900">{automationStats.averageQualityScore.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Ingestion</span>
                <span className="text-sm font-medium text-gray-900">
                  {automationStats.lastIngestion ? new Date(automationStats.lastIngestion).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Newsletter Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Newsletter Analytics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Subscribers</span>
                <span className="text-sm font-medium text-gray-900">{newsletterStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New This Week</span>
                <span className="text-sm font-medium text-gray-900">{newsletterStats.newThisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unsubscribed</span>
                <span className="text-sm font-medium text-gray-900">{newsletterStats.unsubscribed}</span>
              </div>
            </div>
          </div>

          {/* Trending Stories */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trending Stories</h2>
            <div className="space-y-3">
              {trendingStories.length > 0 ? (
                trendingStories.map((storyId, index) => (
                  <div key={storyId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-900 truncate max-w-xs">{storyId}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No trending stories available</p>
              )}
            </div>
          </div>

          {/* Affiliate Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Affiliate Performance</h2>
            <div className="space-y-4">
              {Object.entries(affiliateStats.clicksByProvider).length > 0 ? (
                Object.entries(affiliateStats.clicksByProvider).map(([provider, clicks]) => (
                  <div key={provider} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{provider}</span>
                    <span className="text-sm font-medium text-gray-900">{clicks} clicks</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No affiliate clicks recorded</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Content automation system is active</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-600">Newsletter campaign sent to {newsletterStats.active} subscribers</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">1 day ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-600">New stories ingested from RSS feeds</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">3 days ago</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}