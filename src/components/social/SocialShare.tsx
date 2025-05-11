"use client";

import React, { useState } from 'react';
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Share2,
  Check
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';

interface SocialShareProps {
  /**
   * URL to share
   */
  url: string;

  /**
   * Title to share
   */
  title: string;

  /**
   * Description to share
   */
  description?: string;

  /**
   * Image URL to share
   */
  imageUrl?: string;

  /**
   * Hashtags to include (Twitter only)
   */
  hashtags?: string[];

  /**
   * CSS class for the container
   */
  className?: string;

  /**
   * Whether to show the share button
   */
  showShareButton?: boolean;

  /**
   * Whether to show platform labels
   */
  showLabels?: boolean;

  /**
   * Size of the icons
   */
  iconSize?: number;

  /**
   * Platforms to include
   */
  platforms?: ('facebook' | 'twitter' | 'linkedin' | 'email' | 'copy' | 'medium' | 'youtube' | 'tiktok')[];
}

/**
 * Social sharing component
 */
export function SocialShare({
  url,
  title,
  description = '',
  imageUrl = '', // Image URL for sharing
  hashtags = [],
  className,
  showShareButton = true,
  showLabels = false,
  iconSize = 20,
  platforms = ['facebook', 'twitter', 'linkedin', 'medium', 'email', 'copy'],
}: SocialShareProps) {
  // Not used in this simplified version
  const [_isOpen, _setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Ensure URL is absolute
  const shareUrl = url.startsWith('http') ? url :
    typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

  // Prepare hashtags for Twitter
  const hashtagsString = hashtags.map(tag => tag.startsWith('#') ? tag.substring(1) : tag).join(',');

  // Share URLs for different platforms
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}${hashtagsString ? `&hashtags=${hashtagsString}` : ''}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    medium: `https://medium.com/new-story?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
    youtube: `https://www.youtube.com/share?url=${encodeURIComponent(shareUrl)}`,
    tiktok: `https://www.tiktok.com/upload?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${shareUrl}`)}`,
  };

  // Handle share button click
  const handleShare = () => {
    // Use Web Share API if available
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      navigator.share({
        title,
        text: description,
        url: shareUrl,
        ...(imageUrl ? { image: imageUrl } : {})
      })
        .then(() => {
        // Successfully shared
      })
        .catch((_error) => {
          // Error sharing
        });
    } else {
      // Fallback to popover - no-op in this simplified version
    }
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(_err => {
          // Failed to copy URL
        });
    }
  };

  // Share platform component
  const SharePlatform = ({
    platform,
    icon,
    label,
    onClick
  }: {
    platform: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }) => (
    <a
      href={platform === 'copy' ? '#' : shareUrls[platform as keyof typeof shareUrls]}
      target={platform === 'copy' || platform === 'email' ? '_self' : '_blank'}
      rel="noopener noreferrer"
      onClick={(e) => {
        if (platform === 'copy') {
          e.preventDefault();
          if (onClick) onClick();
        }
      }}
      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
      aria-label={`Share on ${label}`}
    >
      {icon}
      {showLabels && <span>{label}</span>}
    </a>
  );

  // If only showing the share button
  if (showShareButton && typeof navigator !== 'undefined' && 'share' in navigator) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className={cn("flex items-center gap-2", className)}
        aria-label="Share"
      >
        <Share2 size={iconSize} />
        {showLabels && <span>Share</span>}
      </Button>
    );
  }

  // Show popover with share options
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {}}
          className={cn("flex items-center gap-2", className)}
          aria-label="Share"
        >
          <Share2 size={iconSize} />
          {showLabels && <span>Share</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium mb-2">Share this page</div>
          <div className="flex gap-2">
            {platforms.includes('facebook') && (
              <SharePlatform
                platform="facebook"
                icon={<Facebook size={iconSize} className="text-[#1877F2]" />}
                label="Facebook"
              />
            )}

            {platforms.includes('twitter') && (
              <SharePlatform
                platform="twitter"
                icon={<Twitter size={iconSize} className="text-[#1DA1F2]" />}
                label="Twitter"
              />
            )}

            {platforms.includes('linkedin') && (
              <SharePlatform
                platform="linkedin"
                icon={<Linkedin size={iconSize} className="text-[#0A66C2]" />}
                label="LinkedIn"
              />
            )}

            {platforms.includes('medium') && (
              <SharePlatform
                platform="medium"
                icon={<svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-black">
                  <path d="M0 0v24h24V0H0zm19.938 5.686L18.651 6.92a.376.376 0 0 0-.143.362v9.067a.376.376 0 0 0 .143.361l1.257 1.234v.271h-6.322v-.27l1.302-1.265c.128-.128.128-.165.128-.36V8.99l-3.62 9.195h-.49L6.69 8.99v6.163a.85.85 0 0 0 .233.707l1.694 2.054v.271H3.815v-.27L5.51 15.86a.82.82 0 0 0 .218-.707V8.027a.624.624 0 0 0-.203-.527L4.019 5.686v-.27h4.674l3.613 7.923 3.176-7.924h4.456v.271z" />
                </svg>}
                label="Medium"
              />
            )}

            {platforms.includes('youtube') && (
              <SharePlatform
                platform="youtube"
                icon={<svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-[#FF0000]">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>}
                label="YouTube"
              />
            )}

            {platforms.includes('tiktok') && (
              <SharePlatform
                platform="tiktok"
                icon={<svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-black">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>}
                label="TikTok"
              />
            )}

            {platforms.includes('email') && (
              <SharePlatform
                platform="email"
                icon={<Mail size={iconSize} className="text-gray-600" />}
                label="Email"
              />
            )}

            {platforms.includes('copy') && (
              <SharePlatform
                platform="copy"
                icon={copied ? <Check size={iconSize} className="text-green-600" /> : <LinkIcon size={iconSize} className="text-gray-600" />}
                label={copied ? "Copied!" : "Copy Link"}
                onClick={handleCopy}
              />
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
