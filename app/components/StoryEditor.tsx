'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Category, StoryDraft } from '@/types/content';

interface StoryEditorProps {
  content: string;
  initialData?: {
    title?: string;
    summary?: string;
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
    };
  };
  onPublish: (story: StoryDraft) => Promise<void>;
}

export default function StoryEditor({ content, initialData, onPublish }: StoryEditorProps) {
  const [story, setStory] = useState<StoryDraft>({
    title: initialData?.title || '',
    content: content,
    category: 'news',
    status: 'pending',
    author: 'Nuch',
    isReadyToPublish: false,
    summary: initialData?.summary || '',
    featuredImage: {
      url: '',
      alt: ''
    },
    seo: {
      title: initialData?.seo?.title || '',
      description: initialData?.seo?.description || '',
      keywords: initialData?.seo?.keywords || []
    }
  });

  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories: Category[] = ['news', 'reviews', 'tips', 'deals', 'destinations'];

  const handlePublish = async () => {
    if (!story.isReadyToPublish) {
      alert('Please mark the story as ready to publish');
      return;
    }

    setIsSaving(true);
    try {
      await onPublish(story);
      alert('✅ Story published successfully!');
    } catch (error) {
      alert('Failed to publish story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Story Editor</h2>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={story.title}
          onChange={(e) => setStory({ ...story, title: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter story title"
        />
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={story.category}
          onChange={(e) => setStory({ ...story, category: e.target.value as Category })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <textarea
          value={story.content}
          onChange={(e) => setStory({ ...story, content: e.target.value })}
          className="w-full h-64 p-2 border border-gray-300 rounded-md"
          placeholder="Story content"
        />
      </div>

      {/* Summary */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Summary (Optional)
        </label>
        <textarea
          value={story.summary || ''}
          onChange={(e) => setStory({ ...story, summary: e.target.value })}
          className="w-full h-24 p-2 border border-gray-300 rounded-md"
          placeholder="Enter a brief summary"
        />
      </div>

      {/* SEO Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Title
            </label>
            <input
              type="text"
              value={story.seo.title}
              onChange={(e) => setStory({
                ...story,
                seo: { ...story.seo, title: e.target.value }
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="SEO-friendly title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={story.seo.description}
              onChange={(e) => setStory({
                ...story,
                seo: { ...story.seo, description: e.target.value }
              })}
              className="w-full h-24 p-2 border border-gray-300 rounded-md"
              placeholder="Enter meta description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={story.seo.keywords.join(', ')}
              onChange={(e) => setStory({
                ...story,
                seo: { ...story.seo, keywords: e.target.value.split(',').map(k => k.trim()) }
              })}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="travel, news, destination"
            />
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Featured Image
        </label>
        {story.featuredImage.url ? (
          <div className="relative h-48 mb-4">
            <Image
              src={story.featuredImage.url}
              alt={story.featuredImage.alt}
              fill
              className="object-cover rounded-md"
            />
            <button
              onClick={() => setStory({
                ...story,
                featuredImage: { url: '', alt: '' }
              })}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsSearchingImage(true)}
            className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-500 transition-colors"
          >
            Click to add image
          </button>
        )}
      </div>

      {/* Ready to Publish Checkbox */}
      <div className="mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={story.isReadyToPublish}
            onChange={(e) => setStory({ ...story, isReadyToPublish: e.target.checked })}
            className="h-4 w-4 text-brand-teal rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Ready to Publish</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          {previewMode ? 'Edit' : 'Preview'}
        </button>
        <button
          onClick={handlePublish}
          disabled={isSaving || !story.isReadyToPublish}
          className="px-4 py-2 text-white bg-brand-teal rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </div>
  );
} 