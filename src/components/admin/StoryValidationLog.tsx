'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface ValidationLogEntry {
  id: string;
  storyId: string;
  storyTitle: string;
  timestamp: string;
  status: 'success' | 'error';
  message: string;
}

export function StoryValidationLog() {
  const [logEntries, setLogEntries] = useState<ValidationLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchValidationLog() {
      try {
        const response = await fetch('/api/admin/validation-log');
        if (!response.ok) {
          throw new Error('Failed to fetch validation log');
        }
        const data = await response.json();
        setLogEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchValidationLog();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validation Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading validation log...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validation Log</CardTitle>
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
        <CardTitle>Validation Log</CardTitle>
      </CardHeader>
      <CardContent>
        {logEntries.length === 0 ? (
          <p>No validation entries found</p>
        ) : (
          <div className="space-y-4">
            {logEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-lg border ${
                  entry.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{entry.storyTitle}</h3>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      entry.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
                <p className="mt-2">{entry.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 