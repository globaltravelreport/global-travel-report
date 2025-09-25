'use client';

import React from 'react';
import { EnhancedSocialShare } from '@/components/social/EnhancedSocialShare';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Story } from '@/types/Story';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Copy, Rss, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { FacebookShareButton } from '@/components/social/FacebookShareButton';

interface StoryShareSectionProps {
  /**
   * The story to share
   */
  story: Story;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Whether to show the RSS feed link
   */
  showRssFeed?: boolean;

  /**
   * Whether to show the copy link button
   */
  showCopyLink?: boolean;

  /**
   * Whether to show the floating share button
   */
  showFloatingButton?: boolean;
}

/**
 * Enhanced story sharing section with social media, RSS, and copy link functionality
 */
export function StoryShareSection({
  story,
  className = '',
  showRssFeed = true,
  showCopyLink = true,
  showFloatingButton = true,
}: StoryShareSectionProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';
  const storyUrl = `${baseUrl}/stories/${story.slug}`;

  // Ensure image URL is absolute
  const absoluteImageUrl = story.imageUrl && !story.imageUrl.startsWith('http')
    ? `${baseUrl}${story.imageUrl.startsWith('/') ? story.imageUrl : `/${story.imageUrl}`}`
    : story.imageUrl;

  // Generate hashtags from story tags and category
  const hashtags = [
    'globaltravelreport',
    'travel',
    ...(story.tags || []).map(tag => tag.replace(/\s+/g, '')),
  ];

  // Add category and country as hashtags if available
  if (story.category) {
    hashtags.push(story.category.replace(/\s+/g, ''));
  }

  if (story.country && story.country !== 'Global') {
    hashtags.push(story.country.replace(/\s+/g, ''));
  }

  // Remove duplicates and limit to 5 hashtags
  const uniqueHashtags = Array.from(new Set(hashtags)).slice(0, 5);

  // Handle copy link to clipboard
  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(storyUrl)
        .then(() => {
          toast.success('Link copied to clipboard!');
        })
        .catch(_err => {
          toast.error('Failed to copy link');
        });
    }
  };

  // Get RSS feed URL for the story's category
  const getRssFeedUrl = () => {
    if (!story.category) return `${baseUrl}/api/feed/rss`;

    const categorySlug = story.category.toLowerCase().replace(/\s+/g, '-');
    return `${baseUrl}/api/feed/rss?category=${categorySlug}`;
  };

  return (
    <>
      {/* Main share section */}
      <div id="share-section" className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 ${className}`}>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Share this story</h3>
          <p className="text-gray-600 text-sm">Help others discover this travel insight</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Social Media Share Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <div className="flex flex-col items-center justify-center gap-2 p-3 bg-white hover:bg-blue-50 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                </svg>
              </div>
              <FacebookShareButton
                url={storyUrl}
                title={story.title}
                description={story.excerpt || ''}
                imageUrl={absoluteImageUrl || ''}
                className="text-xs font-medium text-gray-700 bg-transparent hover:bg-transparent p-0 h-auto"
              >
                Facebook
              </FacebookShareButton>
            </div>

            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${baseUrl}/stories/${story.slug}`)}&text=${encodeURIComponent(story.title)}&hashtags=${uniqueHashtags.join(',')}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Twitter"
              className="flex flex-col items-center justify-center gap-2 p-3 bg-white hover:bg-blue-50 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 5.8a8.49 8.49 0 0 1-2.36.64 4.13 4.13 0 0 0 1.81-2.27 8.21 8.21 0 0 1-2.61 1 4.1 4.1 0 0 0-7 3.74 11.64 11.64 0 0 1-8.45-4.29 4.16 4.16 0 0 0-.55 2.07 4.09 4.09 0 0 0 1.82 3.41 4.05 4.05 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4 3.93 3.93 0 0 1-1.1.17 4.9 4.9 0 0 1-.77-.07 4.11 4.11 0 0 0 3.83 2.84A8.22 8.22 0 0 1 3 18.34a7.93 7.93 0 0 1-1-.06 11.57 11.57 0 0 0 6.29 1.85A11.59 11.59 0 0 0 20 8.45v-.53a8.43 8.43 0 0 0 2-2.12Z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-700">Twitter</span>
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${baseUrl}/stories/${story.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
              className="flex flex-col items-center justify-center gap-2 p-3 bg-white hover:bg-blue-50 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.5 8.5h-3v10h3v-10ZM5 6.5A1.5 1.5 0 1 0 5 3.5a1.5 1.5 0 0 0 0 3ZM19.5 13c0-2.5-1-4.5-3.5-4.5-1.2 0-2.25.5-3 1.5v-1.5h-3v10h3V13c0-1 0-2 1.5-2s1.5 1.25 1.5 2v5.5h3V13Z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-700">LinkedIn</span>
            </a>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${story.title} ${baseUrl}/stories/${story.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
              className="flex flex-col items-center justify-center gap-2 p-3 bg-white hover:bg-blue-50 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-700">WhatsApp</span>
            </a>

            <a
              href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(`${baseUrl}/stories/${story.slug}`)}&media=${encodeURIComponent(absoluteImageUrl || '')}&description=${encodeURIComponent(story.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on Pinterest"
              className="flex flex-col items-center justify-center gap-2 p-3 bg-white hover:bg-blue-50 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-full bg-[#E60023] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-700">Pinterest</span>
            </a>

            <a
              href={`mailto:?subject=${encodeURIComponent(story.title)}&body=${encodeURIComponent(`${story.excerpt}\n\n${baseUrl}/stories/${story.slug}`)}`}
              aria-label="Share via Email"
              className="flex flex-col items-center justify-center gap-2 p-3 bg-white hover:bg-blue-50 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <span className="text-xs font-medium text-gray-700">Email</span>
            </a>
          </div>

          {/* Copy Link and RSS Feed */}
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            {showCopyLink && (
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md"
              >
                <Copy size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Copy Link</span>
              </button>
            )}

            {showRssFeed && (
              <a
                href={getRssFeedUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md"
              >
                <Rss size={18} className="text-orange-500" />
                <span className="text-sm font-medium text-gray-700">RSS Feed</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Floating share button for mobile */}
      {showFloatingButton && (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <button
            onClick={() => window.scrollTo({ top: document.getElementById('share-section')?.offsetTop || 0, behavior: 'smooth' })}
            className="flex items-center justify-center w-14 h-14 bg-[#19273A] text-white rounded-full shadow-lg hover:bg-[#C9A14A] transition-colors duration-300"
            aria-label="Share this story"
          >
            <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

export default StoryShareSection;
