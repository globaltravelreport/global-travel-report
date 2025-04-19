'use client';

import { useState } from 'react';
import { RewrittenContent } from '@/types/content';

interface ContentRewriterProps {
  onRewriteComplete: (content: RewrittenContent) => void;
}

export default function ContentRewriter({ onRewriteComplete }: ContentRewriterProps) {
  const [originalContent, setOriginalContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRewrite = async () => {
    if (!originalContent && !sourceUrl) {
      setError('Please provide either content or a URL to rewrite');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: originalContent,
          sourceUrl,
          guidelines: {
            type: 'editorial',
            platform: 'Global Travel Report',
            tone: 'informative and friendly',
            format: 'article',
            length: '300-400 words',
            requirements: [
              'Original editorial content',
              'No reference to original source',
              'Conversational tone without emojis',
              'Strong engaging title',
              'One-sentence summary',
              '3-5 SEO keywords',
              'Optional CTA'
            ]
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rewrite content');
      }

      const rewrittenContent: RewrittenContent = await response.json();
      onRewriteComplete(rewrittenContent);
      setOriginalContent('');
      setSourceUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while rewriting content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source URL (Optional)
        </label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="https://example.com/article"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Original Content
        </label>
        <textarea
          value={originalContent}
          onChange={(e) => setOriginalContent(e.target.value)}
          className="w-full h-64 p-2 border border-gray-300 rounded-md"
          placeholder="Paste the content you want to rewrite..."
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        onClick={handleRewrite}
        disabled={isLoading || (!originalContent && !sourceUrl)}
        className="w-full py-2 px-4 bg-brand-teal text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Rewriting...' : 'Rewrite Content'}
      </button>
    </div>
  );
} 