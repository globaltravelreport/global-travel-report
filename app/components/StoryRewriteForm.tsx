'use client';

import { useState } from 'react';

export default function StoryRewriteForm() {
  const [story, setStory] = useState('');
  const [rewrittenStory, setRewrittenStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ story }),
      });

      if (!response.ok) {
        throw new Error('Failed to rewrite story');
      }

      const data = await response.json();
      setRewrittenStory(data.rewrittenStory);
    } catch (err) {
      setError('Failed to rewrite story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Story Rewrite Tool</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="story"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Original Story
          </label>
          <textarea
            id="story"
            name="story"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Paste your story here..."
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Rewriting...' : 'Rewrite Story'}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        {rewrittenStory && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Rewritten Story
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap">{rewrittenStory}</pre>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 