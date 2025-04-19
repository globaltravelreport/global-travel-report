'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Category, StoryDraft } from '@/types/content';
import ImageSearchModal from './ImageSearchModal';

interface StoryEditorProps {
  initialData?: StoryDraft;
  onPublish: (story: StoryDraft) => Promise<void>;
}

export default function StoryEditor({ initialData, onPublish }: StoryEditorProps) {
  console.log('StoryEditor: Component rendering with props:', { initialData });

  const [story, setStory] = useState<StoryDraft>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    category: initialData?.category || 'news',
    status: initialData?.status || 'pending',
    author: initialData?.author || 'Nuch',
    isReadyToPublish: initialData?.isReadyToPublish || false,
    summary: initialData?.summary || '',
    featuredImage: initialData?.featuredImage || {
      url: '',
      alt: ''
    },
    seo: {
      title: initialData?.seo?.title || '',
      description: initialData?.seo?.description || '',
      keywords: initialData?.seo?.keywords || []
    }
  });

  useEffect(() => {
    console.log('StoryEditor: Component mounted');
    console.log('StoryEditor: Initial story state:', story);
  }, []);

  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories: Category[] = ['news', 'reviews', 'tips', 'deals', 'destinations'];

  const handlePublish = async () => {
    console.log('StoryEditor: Attempting to publish');
    if (!story.isReadyToPublish) {
      alert('Please mark the story as ready to publish');
      return;
    }

    setIsSaving(true);
    try {
      await onPublish(story);
      alert('✅ Story published successfully!');
    } catch (error) {
      console.error('StoryEditor: Publish error:', error);
      alert('Failed to publish story. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      
      setStory({
        ...story,
        featuredImage: {
          url: data.url,
          alt: file.name
        }
      });
    } catch (error) {
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={story.title}
          onChange={(e) => setStory({ ...story, title: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
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
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
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
          className="w-full h-64 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
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
          className="w-full h-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
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
              className="w-full h-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
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
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
              <label className="cursor-pointer text-center">
                <div className="text-gray-500 hover:text-gray-700">
                  Click to upload image
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-center">
              <span className="text-gray-500">or</span>
            </div>
            <button
              onClick={() => setIsSearchingImage(true)}
              className="w-full h-12 border-2 border-gray-300 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-500 transition-colors"
            >
              Search Unsplash Images
            </button>
          </div>
        )}
      </div>

      {/* Ready to Publish Checkbox */}
      <div className="mb-6">
        <label className="flex items-center space-x-2">
          <input
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
          onClick={() => setPreviewMode(!previewMode)}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          {previewMode ? 'Edit' : 'Preview'}
        </button>
        <button
          onClick={handlePublish}
          disabled={isSaving || !story.isReadyToPublish}
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