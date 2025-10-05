'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentBotPipeline } from '@/src/services/ContentBotPipeline';
import { EnhancedRSSFeedService } from '@/src/services/EnhancedRSSFeedService';
import { LocationAccurateImageService } from '@/src/services/LocationAccurateImageService';
import { SocialDistributionBot } from '@/src/services/SocialDistributionBot';

interface PipelineStats {
  totalProcessed: number;
  pendingModeration: number;
  approved: number;
  published: number;
  lastRun?: Date;
}

interface RSSStats {
  totalFeeds: number;
  feedsProcessed: number;
  itemsInModeration: number;
  averageQualityScore: number;
}

export function RSSManagementClient() {
  const [pipelineStats, setPipelineStats] = useState<PipelineStats | null>(null);
  const [rssStats, setRssStats] = useState<RSSStats | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const pipeline = ContentBotPipeline.getInstance();
      const rssService = EnhancedRSSFeedService.getInstance();

      const [pipelineData, rssData] = await Promise.all([
        pipeline.getPipelineStats(),
        rssService.getRSSStats(),
      ]);

      setPipelineStats(pipelineData);
      setRssStats(rssData);
    } catch (_error) {
      console.error(_error);
    }
  };

  const runPipeline = async () => {
    try {
      setIsRunning(true);
      const pipeline = ContentBotPipeline.getInstance();
      const result = await pipeline.runPipeline();
      setLastResult(result);
      await loadStats(); // Reload stats after run
    } catch (_error) {
      console.error(_error);
    } finally {
      setIsRunning(false);
    }
  };

  const runRSSFetch = async () => {
    try {
      setIsRunning(true);
      const rssService = EnhancedRSSFeedService.getInstance();
      const result = await rssService.fetchAllFeeds();
      setLastResult(result);
      await loadStats();
    } catch (_error) {
      console.error(_error);
    } finally {
      setIsRunning(false);
    }
  };

  const prefetchImages = async () => {
    try {
      setIsRunning(true);
      const imageService = LocationAccurateImageService.getInstance();
      await imageService.prefetchCommonLocationImages();
      console.log('✅ Image pre-fetching completed');
    } catch (_error) {
      console.error(_error);
    } finally {
      setIsRunning(false);
    }
  };

  const testDistribution = async () => {
    try {
      setIsRunning(true);
      const distributionBot = SocialDistributionBot.getInstance();
      const stats = await distributionBot.getDistributionStats();
      console.log('📊 Distribution stats:', stats);
    } catch (_error) {
      console.error(_error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Content Pipeline Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={runPipeline}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? 'Running Pipeline...' : '🚀 Run Full Pipeline'}
            </Button>

            <Button
              onClick={runRSSFetch}
              disabled={isRunning}
              variant="outline"
            >
              📡 Fetch RSS Only
            </Button>

            <Button
              onClick={prefetchImages}
              disabled={isRunning}
              variant="outline"
            >
              🖼️ Pre-fetch Images
            </Button>

            <Button
              onClick={testDistribution}
              disabled={isRunning}
              variant="outline"
            >
              📢 Test Distribution
            </Button>
          </div>

          {lastResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Last Run Result:</h4>
              <pre className="text-sm text-gray-700">
                {JSON.stringify(lastResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineStats?.totalProcessed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pipelineStats?.pendingModeration || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pipelineStats?.approved || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pipelineStats?.published || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Pipeline Overview</TabsTrigger>
          <TabsTrigger value="feeds">RSS Feeds</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Pipeline Health:</span>
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Last Run:</span>
                  <span className="text-sm text-gray-600">
                    {pipelineStats?.lastRun ? new Date(pipelineStats.lastRun).toLocaleString() : 'Never'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Auto-Processing:</span>
                  <Badge className="bg-blue-100 text-blue-800">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feeds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RSS Feed Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total RSS Feeds:</span>
                  <span className="font-medium">{rssStats?.totalFeeds || 0}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Items in Moderation:</span>
                  <span className="font-medium text-orange-600">{rssStats?.itemsInModeration || 0}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Average Quality Score:</span>
                  <span className="font-medium">
                    {rssStats?.averageQualityScore ? (rssStats.averageQualityScore * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Auto-Ingestion:</span>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Manual Approval Required:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Yes</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Auto-Publishing:</span>
                  <Badge className="bg-blue-100 text-blue-800">Enabled</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Social Distribution:</span>
                  <Badge className="bg-purple-100 text-purple-800">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={runPipeline}
              disabled={isRunning}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              🚀 Run Complete Pipeline
            </Button>

            <Button
              onClick={runRSSFetch}
              disabled={isRunning}
              variant="outline"
            >
              📡 Fetch New Content
            </Button>

            <Button
              onClick={prefetchImages}
              disabled={isRunning}
              variant="outline"
            >
              🖼️ Optimize Images
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}