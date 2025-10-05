'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastPost?: Date;
  postCount: number;
  rateLimit?: {
    postsPerHour: number;
    remaining: number;
    resetTime: Date;
  };
}

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledTime: Date;
  status: 'scheduled' | 'posted' | 'failed';
  imageUrl?: string;
  hashtags: string[];
}

interface SocialAutomationProps {
  onConnect?: (platform: string) => void;
  onSchedule?: (post: Omit<ScheduledPost, 'id' | 'status'>) => void;
  onAnalyticsUpdate?: (analytics: any) => void;
}

export function useSocialAutomation() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'facebook',
      connected: false,
      postCount: 0,
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: 'twitter',
      connected: false,
      postCount: 0,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: 'linkedin',
      connected: false,
      postCount: 0,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: 'instagram',
      connected: false,
      postCount: 0,
    },
  ]);

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    totalEngagement: 0,
    topPerforming: [] as any[],
    bestTimeToPost: [] as string[],
  });

  const connectPlatform = async (platformId: string) => {
    setIsLoading(true);

    try {
      // Simulate API connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPlatforms(prev => prev.map(platform =>
        platform.id === platformId
          ? { ...platform, connected: true }
          : platform
      ));

      return { success: true };
    } catch (_error) {
      return { success: false, error: 'Connection failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectPlatform = async (platformId: string) => {
    setPlatforms(prev => prev.map(platform =>
      platform.id === platformId
        ? { ...platform, connected: false }
        : platform
    ));
  };

  const schedulePost = async (postData: Omit<ScheduledPost, 'id' | 'status'>) => {
    const newPost: ScheduledPost = {
      ...postData,
      id: Date.now().toString(),
      status: 'scheduled',
    };

    setScheduledPosts(prev => [...prev, newPost]);

    // Simulate posting at scheduled time
    const timeUntilPost = newPost.scheduledTime.getTime() - Date.now();
    if (timeUntilPost > 0) {
      setTimeout(() => {
        setScheduledPosts(prev => prev.map(post =>
          post.id === newPost.id
            ? { ...post, status: 'posted' }
            : post
        ));
      }, timeUntilPost);
    }

    return newPost;
  };

  const generateOptimalPostTimes = () => {
    // Based on platform best practices
    const optimalTimes = {
      facebook: ['09:00', '12:00', '15:00', '19:00'],
      twitter: ['08:00', '12:00', '17:00', '21:00'],
      linkedin: ['07:30', '09:00', '12:00', '17:30'],
      instagram: ['11:00', '13:00', '19:00'],
    };

    return optimalTimes;
  };

  const generateHashtags = (content: string, count: number = 5): string[] => {
    const travelKeywords = [
      'travel', 'wanderlust', 'adventure', 'vacation', 'holiday',
      'explore', 'discover', 'journey', 'trip', 'destination',
      'travelgram', 'instatravel', 'travelblogger', 'travelphotography',
      'beautifuldestinations', 'passportready', 'traveladdict', 'roamtheplanet'
    ];

    // Extract keywords from content
    const contentWords = content.toLowerCase().split(' ');
    const relevantKeywords = travelKeywords.filter(keyword =>
      contentWords.some(word => word.includes(keyword) || keyword.includes(word))
    );

    // Fill remaining slots with popular travel hashtags
    const remainingCount = count - relevantKeywords.length;
    const popularHashtags = travelKeywords.slice(0, remainingCount);

    return [...relevantKeywords, ...popularHashtags].slice(0, count);
  };

  const generatePostContent = (story: any): string => {
    const templates = [
      `✈️ ${story.title}\n\n${story.excerpt}\n\n#Travel #Adventure #Wanderlust`,
      `Just discovered: ${story.title}\n\n${story.excerpt}\n\nLink in bio for the full story! 🗺️`,
      `Travel inspiration: ${story.title}\n\n${story.excerpt}\n\n#TravelTips #Explore`,
      `🌍 ${story.title}\n\n${story.excerpt}\n\nPerfect for your next adventure!`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  };

  const bulkSchedulePosts = async (stories: any[], days: number = 7) => {
    const postsToSchedule: Omit<ScheduledPost, 'id' | 'status'>[] = [];
    const optimalTimes = generateOptimalPostTimes();

    stories.forEach((story, index) => {
      const postDate = new Date();
      postDate.setDate(postDate.getDate() + Math.floor(index / 4)); // Spread over days
      postDate.setHours(parseInt(optimalTimes.facebook[index % 4].split(':')[0]));
      postDate.setMinutes(parseInt(optimalTimes.facebook[index % 4].split(':')[1]));

      const content = generatePostContent(story);
      const hashtags = generateHashtags(content);

      postsToSchedule.push({
        content,
        platforms: ['facebook', 'twitter', 'linkedin'],
        scheduledTime: postDate,
        imageUrl: story.imageUrl,
        hashtags,
      });
    });

    const scheduledPosts = await Promise.all(
      postsToSchedule.map(post => schedulePost(post))
    );

    return scheduledPosts;
  };

  const getAnalytics = async () => {
    // Simulate analytics data
    const mockAnalytics = {
      totalPosts: scheduledPosts.filter(p => p.status === 'posted').length,
      totalEngagement: Math.floor(Math.random() * 10000) + 5000,
      topPerforming: [
        { platform: 'Facebook', engagement: 2500, reach: 15000 },
        { platform: 'Twitter', engagement: 1800, reach: 12000 },
        { platform: 'LinkedIn', engagement: 1200, reach: 8000 },
      ],
      bestTimeToPost: ['9:00 AM', '12:00 PM', '3:00 PM'],
    };

    setAnalytics(mockAnalytics);
    return mockAnalytics;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getAnalytics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    platforms,
    scheduledPosts,
    isLoading,
    analytics,
    connectPlatform,
    disconnectPlatform,
    schedulePost,
    bulkSchedulePosts,
    generateHashtags,
    generatePostContent,
    generateOptimalPostTimes,
    getAnalytics,
  };
}

export function SocialAutomation({
  onConnect,
  onSchedule,
  onAnalyticsUpdate,
}: SocialAutomationProps) {
  const {
    platforms,
    scheduledPosts,
    isLoading,
    analytics,
    connectPlatform,
    disconnectPlatform,
    schedulePost,
    bulkSchedulePosts,
    generateHashtags,
    generatePostContent,
    generateOptimalPostTimes,
    getAnalytics,
  } = useSocialAutomation();

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postContent, setPostContent] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  useEffect(() => {
    if (onAnalyticsUpdate && analytics) {
      onAnalyticsUpdate(analytics);
    }
  }, [analytics, onAnalyticsUpdate]);

  const handleConnect = async (platformId: string) => {
    const result = await connectPlatform(platformId);
    if (result.success && onConnect) {
      onConnect(platformId);
    }
  };

  const handleSchedule = async () => {
    if (!postContent || selectedPlatforms.length === 0 || !scheduledTime) return;

    const scheduledDate = new Date(scheduledTime);
    const result = await schedulePost({
      content: postContent,
      platforms: selectedPlatforms,
      scheduledTime: scheduledDate,
      imageUrl: imageUrl || undefined,
      hashtags,
    });

    if (onSchedule) {
      onSchedule(result);
    }

    // Reset form
    setPostContent('');
    setSelectedPlatforms([]);
    setScheduledTime('');
    setImageUrl('');
    setHashtags([]);
    setShowScheduleForm(false);
  };

  const handleBulkSchedule = async () => {
    // This would typically get stories from your CMS
    const mockStories = [
      { title: 'Top 10 Destinations for 2024', excerpt: 'Discover the most amazing places to visit', imageUrl: '/images/destinations.jpg' },
      { title: 'Budget Travel Tips', excerpt: 'How to travel the world on a shoestring', imageUrl: '/images/budget-travel.jpg' },
      { title: 'Hidden Gems in Europe', excerpt: 'Secret spots most tourists miss', imageUrl: '/images/europe-gems.jpg' },
    ];

    await bulkSchedulePosts(mockStories);
  };

  const getPlatformIcon = (platformId: string) => {
    const icons = {
      facebook: '🔵',
      twitter: '🐦',
      linkedin: '💼',
      instagram: '📷',
    };
    return icons[platformId as keyof typeof icons] || '📱';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      case 'posted': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="social-automation space-y-6">
      {/* Platform Connections */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Connected Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map((platform) => (
            <div key={platform.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getPlatformIcon(platform.id)}</span>
                  <span className="font-medium">{platform.name}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  platform.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {platform.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {platform.connected && (
                <div className="text-sm text-gray-600 mb-3">
                  <div>Posts: {platform.postCount}</div>
                  {platform.lastPost && (
                    <div>Last post: {platform.lastPost.toLocaleDateString()}</div>
                  )}
                </div>
              )}

              <button
                onClick={() => platform.connected
                  ? disconnectPlatform(platform.id)
                  : handleConnect(platform.id)
                }
                disabled={isLoading}
                className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                  platform.connected
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-50`}
              >
                {isLoading ? 'Connecting...' : platform.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Schedule Post
          </button>
          <button
            onClick={handleBulkSchedule}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Bulk Schedule
          </button>
          <button
            onClick={getAnalytics}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Update Analytics
          </button>
        </div>
      </div>

      {/* Schedule Post Form */}
      {showScheduleForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Schedule New Post</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="schedule-content" className="block text-sm font-medium mb-2">Content</label>
              <textarea
                id="schedule-content"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full p-3 border rounded resize-none"
                rows={4}
                placeholder="What's on your mind?"
              />
              <div className="text-xs text-gray-500 mt-1">
                {postContent.length}/280 characters
              </div>
            </div>

            <div>
              <div id="schedule-platforms" className="block text-sm font-medium mb-2">Platforms</div>
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby="schedule-platforms">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => {
                      setSelectedPlatforms(prev =>
                        prev.includes(platform.id)
                          ? prev.filter(p => p !== platform.id)
                          : [...prev, platform.id]
                      );
                    }}
                    disabled={!platform.connected}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedPlatforms.includes(platform.id)
                        ? 'bg-blue-600 text-white'
                        : platform.connected
                        ? 'bg-gray-200 hover:bg-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {getPlatformIcon(platform.id)} {platform.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="schedule-time" className="block text-sm font-medium mb-2">Schedule Time</label>
                <input
                  id="schedule-time"
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full p-2 border rounded"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <label htmlFor="image-url" className="block text-sm font-medium mb-2">Image URL (optional)</label>
                <input
                  id="image-url"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <div id="schedule-hashtags" className="block text-sm font-medium mb-2">Hashtags</div>
              <div className="flex flex-wrap gap-2 mb-2" role="group" aria-labelledby="schedule-hashtags">
                {hashtags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  if (postContent) {
                    const generated = generateHashtags(postContent, 5);
                    setHashtags(generated);
                  }
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors text-sm"
              >
                Generate Hashtags
              </button>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowScheduleForm(false)}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={!postContent || selectedPlatforms.length === 0 || !scheduledTime}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Schedule Post
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Scheduled Posts */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Scheduled Posts</h3>
        <div className="space-y-3">
          {scheduledPosts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-900 mb-2">{post.content}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Platforms: {post.platforms.join(', ')}</span>
                    <span>Scheduled: {post.scheduledTime.toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded font-medium ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {scheduledPosts.length === 0 && (
            <p className="text-gray-500 text-center py-8">No scheduled posts</p>
          )}
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Analytics Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalPosts}</div>
              <div className="text-sm text-blue-800">Total Posts</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">{analytics.totalEngagement.toLocaleString()}</div>
              <div className="text-sm text-green-800">Total Engagement</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">{analytics.bestTimeToPost.length}</div>
              <div className="text-sm text-purple-800">Optimal Time Slots</div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Best Time to Post</h4>
            <div className="flex flex-wrap gap-2">
              {analytics.bestTimeToPost.map((time, index) => (
                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded">
                  {time}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}