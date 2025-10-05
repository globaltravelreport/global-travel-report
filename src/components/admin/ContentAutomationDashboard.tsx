'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Star,
  Users,
  TrendingUp,
  RefreshCw,
  Clock
} from 'lucide-react';

interface AutomationStats {
  totalStories: number;
  storiesThisWeek: number;
  averageQualityScore: number;
  lastIngestion: Date | null;
}

interface Story {
  id: string;
  title: string;
  category: string;
  country: string;
  featured: boolean;
  editorsPick: boolean;
  publishedAt: string;
  qualityScore?: number;
}

export default function ContentAutomationDashboard() {
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);

  // Load automation statistics
  useEffect(() => {
    loadStats();
    loadStories();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/featured-stories');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (_error) {
      console.error(_error);
    }
  };

  const loadStories = async () => {
    try {
      const response = await fetch('/api/stories?limit=50');
      if (response.ok) {
        const data = await response.json();
        setStories(data);
      }
    } catch (_error) {
      console.error(_error);
    } finally {
      setLoading(false);
    }
  };

  const triggerIngestion = async () => {
    setIngesting(true);
    try {
      const response = await fetch('/api/admin/ingest-content', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token', // In production, use proper auth
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Ingestion result:', result);
        // Refresh stats and stories
        await loadStats();
        await loadStories();
      }
    } catch (_error) {
      console.error(_error);
    } finally {
      setIngesting(false);
    }
  };

  const setFeaturedStory = async (storyId: string) => {
    try {
      const response = await fetch('/api/admin/featured-stories', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'setFeatured',
          storyId
        })
      });

      if (response.ok) {
        await loadStories(); // Refresh stories to show updated featured status
      }
    } catch (_error) {
      console.error(_error);
    }
  };

  const setEditorsPicks = async () => {
    if (selectedStories.length === 0) return;

    try {
      const response = await fetch('/api/admin/featured-stories', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'setEditorsPicks',
          storyIds: selectedStories
        })
      });

      if (response.ok) {
        setSelectedStories([]);
        await loadStories();
      }
    } catch (_error) {
      console.error(_error);
    }
  };

  const toggleStorySelection = (storyId: string) => {
    setSelectedStories(prev =>
      prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading automation dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Automation</h1>
          <p className="text-gray-600 mt-1">Manage automated content ingestion and curation</p>
        </div>
        <Button
          onClick={triggerIngestion}
          disabled={ingesting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {ingesting ? (
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {ingesting ? 'Ingesting...' : 'Trigger Ingestion'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStories || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.storiesThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">
              New stories added
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageQualityScore ? `${(stats.averageQualityScore * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Content quality score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {stats?.lastIngestion
                ? new Date(stats.lastIngestion).toLocaleDateString()
                : 'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Last ingestion date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Management */}
      <Tabs defaultValue="stories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stories">Manage Stories</TabsTrigger>
          <TabsTrigger value="featured">Featured Content</TabsTrigger>
          <TabsTrigger value="settings">Automation Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="stories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stories</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={setEditorsPicks}
                  disabled={selectedStories.length === 0}
                >
                  Set as Editor's Picks ({selectedStories.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stories.slice(0, 20).map((story) => (
                  <div
                    key={story.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedStories.includes(story.id)}
                        onChange={() => toggleStorySelection(story.id)}
                        className="w-4 h-4"
                      />
                      <div>
                        <h4 className="font-medium">{story.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{story.category}</Badge>
                          <Badge variant="outline">{story.country}</Badge>
                          {story.featured && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {story.editorsPick && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Editor's Pick
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setFeaturedStory(story.id)}
                      >
                        Set Featured
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Featured Story */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Featured Story
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stories.find(s => s.featured) ? (
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      {stories.find(s => s.featured)?.title}
                    </h4>
                    <Badge>{stories.find(s => s.featured)?.category}</Badge>
                  </div>
                ) : (
                  <p className="text-gray-500">No featured story set</p>
                )}
              </CardContent>
            </Card>

            {/* Editor's Picks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Editor's Picks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stories.filter(s => s.editorsPick).map((story) => (
                    <div key={story.id} className="flex items-center justify-between">
                      <span className="text-sm">{story.title}</span>
                      <Badge variant="outline">{story.category}</Badge>
                    </div>
                  ))}
                  {stories.filter(s => s.editorsPick).length === 0 && (
                    <p className="text-gray-500">No editor's picks set</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto Ingestion</h4>
                  <p className="text-sm text-gray-600">Automatically fetch new content from RSS feeds</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Quality Threshold</h4>
                  <p className="text-sm text-gray-600">Minimum quality score for auto-approval</p>
                </div>
                <Badge variant="outline">70%</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Max Stories/Day</h4>
                  <p className="text-sm text-gray-600">Maximum stories to ingest per day</p>
                </div>
                <Badge variant="outline">5</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}