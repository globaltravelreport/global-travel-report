'use client';

import React from 'react';
import { EnhancedSocialShare } from '@/src/components/social/EnhancedSocialShare';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Story } from '@/types/Story';
import { Separator } from '@/src/components/ui/separator';
import { Button } from '@/src/components/ui/button';
import { Copy, Rss } from 'lucide-react';
import { toast } from 'sonner';

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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  const storyUrl = `${baseUrl}/stories/${story.slug}`;
  
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
      <Card className={`border-t border-b rounded-none shadow-none ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Share this story</CardTitle>
          <CardDescription>Help others discover this travel insight</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <EnhancedSocialShare
              url={`/stories/${story.slug}`}
              title={story.title}
              description={story.excerpt}
              imageUrl={story.imageUrl}
              hashtags={uniqueHashtags}
              showShareButton={false}
              showLabels={true}
              iconSize={24}
              platforms={['facebook', 'twitter', 'linkedin', 'whatsapp', 'pinterest', 'email']}
              trackShares={true}
              utmSource="globaltravelreport"
              utmMedium="social"
              utmCampaign="story_share"
            />
            
            {showCopyLink && (
              <>
                <Separator orientation="vertical" className="h-8 hidden md:block" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyLink}
                  className="flex items-center gap-2"
                >
                  <Copy size={16} />
                  <span>Copy Link</span>
                </Button>
              </>
            )}
            
            {showRssFeed && (
              <>
                <Separator orientation="vertical" className="h-8 hidden md:block" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="flex items-center gap-2"
                >
                  <a href={getRssFeedUrl()} target="_blank" rel="noopener noreferrer">
                    <Rss size={16} />
                    <span>RSS Feed</span>
                  </a>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Floating share button for mobile */}
      {showFloatingButton && (
        <div className="md:hidden">
          <EnhancedSocialShare
            url={`/stories/${story.slug}`}
            title={story.title}
            description={story.excerpt}
            imageUrl={story.imageUrl}
            hashtags={uniqueHashtags}
            floating={true}
            floatingPosition="bottom-right"
            trackShares={true}
            utmSource="globaltravelreport"
            utmMedium="social"
            utmCampaign="story_share_floating"
          />
        </div>
      )}
    </>
  );
}

export default StoryShareSection;
