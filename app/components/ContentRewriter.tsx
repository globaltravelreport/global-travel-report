'use client';

import { useState } from 'react';

export default function ContentRewriter() {
  const [content, setContent] = useState('');
  const [rewrittenContent, setRewrittenContent] = useState('');
  const [platform, setPlatform] = useState('facebook');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRewrite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content to rewrite');
      return;
    }

    setIsLoading(true);
    setError('');
    setRewrittenContent('');

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content,
          platform,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to rewrite content');
      }

      setRewrittenContent(data.content);
    } catch (err) {
      console.error('Rewrite error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while rewriting the content');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(rewrittenContent);
      // Optionally show a success message
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Content Rewriter</h2>
      
      <div className="mb-4">
        <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
          Select Platform
        </label>
        <select
          id="platform"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          <option value="facebook">Facebook</option>
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter</option>
          <option value="instagram">Instagram</option>
          <option value="blog">Blog</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Original Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter the content you want to rewrite..."
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleRewrite}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Rewriting...
          </>
        ) : (
          'Rewrite Content'
        )}
      </button>

      {rewrittenContent && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Rewritten Content</h3>
            <button
              onClick={copyToClipboard}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Copy to Clipboard
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="whitespace-pre-wrap">{rewrittenContent}</p>
          </div>
        </div>
      )}
    </div>
  );
} 