'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Category, StoryDraft } from '@/types/content';
import ImageSearchModal from './ImageSearchModal';
import { logger } from '@/app/utils/logger';

interface StoryEditorProps {
  initialData?: StoryDraft;
  onPublish: (story: StoryDraft) => Promise<void>;
}

export default function StoryEditor({ initialData, onPublish }: StoryEditorProps) {
  const [story, setStory] = useState<StoryDraft>(initialData || {
    title: '',
    content: '',
    category: 'news',
    status: 'draft',
    author: 'Nuch',
    isReadyToPublish: false,
    summary: '',
    slug: '',
    featuredImage: undefined,
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  });

  useEffect(() => {
    if (initialData) {
      logger.debug('Initializing story editor', { storyId: initialData.slug });
      setStory(initialData);
    }
  }, [initialData]);

  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories: Category[] = ['news', 'reviews', 'tips', 'deals', 'destinations'];

  const handlePublish = async () => {
    console.log('StoryEditor: Attempting to publish');
    setIsSaving(true);
    try {
      await onPublish(story);
      logger.info('Story published successfully', { storyId: story.slug });
      alert('✅ Story published successfully!');
    } catch (error) {
      logger.error('Failed to publish story', error);
      console.error('StoryEditor: Publish error:', error);
      alert('Failed to publish story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      setStory(prev => ({
        ...prev,
        featuredImage: {
          url: data.url,
          alt: data.alt || file.name
        }
      }));

      logger.info('Image uploaded successfully', { imageUrl: data.url });
    } catch (error) {
      logger.error('Failed to upload image', error);
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleImageSelect = (url: string, alt: string) => {
    setStory({
      ...story,
      featuredImage: {
        url,
        alt
      }
    });
    setIsSearchingImage(false);
  };

  console.log('StoryEditor: Rendering form');
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Story Editor</h2>

      {/* Title */}
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={story.title}
          onChange={(e) => setStory({ ...story, title: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
          placeholder="Enter story title"
        />
      </div>

      {/* Category */}
      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          id="category"
          value={story.category}
          onChange={(e) => setStory({ ...story, category: e.target.value as Category })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="mb-6">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <textarea
          id="content"
          value={story.content}
          onChange={(e) => setStory({ ...story, content: e.target.value })}
          className="w-full h-64 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
          placeholder="Story content"
        />
      </div>

      {/* Summary */}
      <div className="mb-6">
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
          Summary
        </label>
        <textarea
          id="summary"
          value={story.summary || ''}
          onChange={(e) => setStory({ ...story, summary: e.target.value })}
          className="w-full h-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
          placeholder="Enter a brief summary"
        />
      </div>

      {/* SEO Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="seo-title" className="block text-sm font-medium text-gray-700 mb-2">
              SEO Title
            </label>
            <input
              id="seo-title"
              type="text"
              value={story.seo?.title || ''}
              onChange={(e) => setStory({
                ...story,
                seo: { ...story.seo || {}, title: e.target.value }
              })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              placeholder="SEO-friendly title"
            />
          </div>

          <div>
            <label htmlFor="meta-description" className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              id="meta-description"
              value={story.seo?.description || ''}
              onChange={(e) => setStory({
                ...story,
                seo: { ...story.seo || {}, description: e.target.value }
              })}
              className="w-full h-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              placeholder="Meta description for search engines"
            />
          </div>

          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
              Keywords (comma-separated)
            </label>
            <input
              id="keywords"
              type="text"
              value={story.seo?.keywords?.join(', ') || ''}
              onChange={(e) => setStory({
                ...story,
                seo: { ...story.seo || {}, keywords: e.target.value.split(',').map(k => k.trim()) }
              })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              placeholder="Keywords (comma-separated)"
            />
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="mb-6">
        <label htmlFor="featured-image" className="block text-sm font-medium text-gray-700 mb-2">
          Featured Image
        </label>
        {story.featuredImage?.url ? (
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
                featuredImage: undefined
              })}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
              <label htmlFor="featured-image" className="cursor-pointer text-center">
                <input
                  id="featured-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <span className="text-gray-600">Click to upload or drag and drop</span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => setIsSearchingImage(true)}
              className="text-brand-teal hover:text-teal-700"
            >
              Or search for an image
            </button>
          </div>
        )}
      </div>

      {/* Ready to Publish */}
      <div className="mb-6">
        <label className="flex items-center space-x-2">
          <input
            id="ready-to-publish"
            type="checkbox"
            checked={story.isReadyToPublish}
            onChange={(e) => setStory({ ...story, isReadyToPublish: e.target.checked })}
            className="h-4 w-4 text-brand-teal rounded border-gray-300 focus:ring-2 focus:ring-brand-teal"
          />
          <span className="text-sm font-medium text-gray-700">Ready to Publish</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Preview
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={!story.isReadyToPublish || isSaving}
          className="px-4 py-2 text-white bg-brand-teal rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2"
        >
          {isSaving ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      <ImageSearchModal
        isOpen={isSearchingImage}
        onClose={() => setIsSearchingImage(false)}
        onSelectImage={handleImageSelect}
      />
    </div>
  );
} 