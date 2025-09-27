'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface ScheduledStory {
  id: string;
  title: string;
  category: string;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
}

export function StoryPublishingSchedule() {
  const [scheduledStories, setScheduledStories] = useState<ScheduledStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/api/admin/publishing-schedule');
        if (!response.ok) {
          throw new Error('Failed to fetch publishing schedule');
        }
        const data = await response.json();
        setScheduledStories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
    const interval = setInterval(fetchSchedule, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Publishing Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading schedule...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Publishing Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publishing Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {scheduledStories.length === 0 ? (
          <p>No stories scheduled for publishing</p>
        ) : (
          <div className="space-y-4">
            {scheduledStories.map((story) => (
              <div
                key={story.id}
                className="p-4 rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{story.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(story.scheduledTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Category: {story.category}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      story.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : story.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 