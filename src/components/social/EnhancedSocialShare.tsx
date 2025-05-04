'use client';

import React, { useState } from 'react';
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail as MailIcon,
  Link as LinkIcon,
  Share2,
  Check,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';

interface EnhancedSocialShareProps {
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
  platforms?: ('facebook' | 'twitter' | 'linkedin' | 'email' | 'copy' | 'medium' | 'youtube' | 'tiktok' | 'whatsapp' | 'pinterest')[];

  /**
   * Whether to show as a floating button
   */
  floating?: boolean;

  /**
   * Position of the floating button
   */
  floatingPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

  /**
   * Whether to track shares with UTM parameters
   */
  trackShares?: boolean;

  /**
   * UTM source to add to shared URLs
   */
  utmSource?: string;

  /**
   * UTM medium to add to shared URLs
   */
  utmMedium?: string;

  /**
   * UTM campaign to add to shared URLs
   */
  utmCampaign?: string;
}

/**
 * Enhanced social sharing component with tracking and more platforms
 */
export function EnhancedSocialShare({
  url,
  title,
  description = '',
  imageUrl = '',
  hashtags = ['travel', 'globaltravelreport'],
  className,
  showShareButton = true,
  showLabels = false,
  iconSize = 20,
  platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'pinterest', 'email', 'copy'],
  floating = false,
  floatingPosition = 'bottom-right',
  trackShares = true,
  utmSource = 'globaltravelreport',
  utmMedium = 'social',
  utmCampaign = 'share',
}: EnhancedSocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Ensure URL is absolute
  const baseUrl = url.startsWith('http') ? url :
    typeof window !== 'undefined'
      ? `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'}${url.startsWith('/') ? url : `/${url}`}`;

  // Ensure image URL is absolute
  const absoluteImageUrl = imageUrl && !imageUrl.startsWith('http')
    ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
    : imageUrl;

  // Add UTM parameters if tracking is enabled
  const shareUrl = trackShares
    ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`
    : baseUrl;

  // Prepare hashtags for Twitter
  const hashtagsString = hashtags.map(tag => tag.startsWith('#') ? tag.substring(1) : tag).join(',');

  // Share URLs for different platforms
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&picture=${encodeURIComponent(absoluteImageUrl || '')}&quote=${encodeURIComponent(title)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}${hashtagsString ? `&hashtags=${hashtagsString}` : ''}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    medium: `https://medium.com/new-story?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
    youtube: `https://www.youtube.com/share?url=${encodeURIComponent(shareUrl)}`,
    tiktok: `https://www.tiktok.com/upload?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(absoluteImageUrl || '')}&description=${encodeURIComponent(title)}`,
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
        ...(absoluteImageUrl ? { image: absoluteImageUrl } : {})
      })
        .then(() => {
          toast.success('Shared successfully!');
        })
        .catch((error) => {
          // Only show error if it's not a user cancellation
          if (error.name !== 'AbortError') {
            toast.error('Error sharing content');
          }
        });
    } else {
      // Fallback to popover
      setIsOpen(true);
    }
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setCopied(true);
          toast.success('Link copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(_err => {
          toast.error('Failed to copy link');
        });
    }
  };

  // Track share event
  const trackShare = (platform: string) => {
    // If window and gtag are available, track the share event
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: 'article',
        item_id: url,
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
        } else {
          trackShare(platform);
        }
      }}
      className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
      aria-label={`Share on ${label}`}
    >
      {icon}
      {showLabels && <span>{label}</span>}
    </a>
  );

  // If only showing the share button and Web Share API is available
  if (showShareButton && typeof navigator !== 'undefined' && 'share' in navigator && !floating) {
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

  // Floating button styles
  const floatingStyles = floating ? {
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
  }[floatingPosition] : '';

  // Show popover with share options
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={floating ? "default" : "ghost"}
          size={floating ? "icon" : "sm"}
          onClick={() => setIsOpen(true)}
          className={cn(
            "flex items-center gap-2",
            className,
            floatingStyles,
            floating && "rounded-full shadow-lg h-12 w-12"
          )}
          aria-label="Share"
        >
          <Share2 size={iconSize} />
          {showLabels && !floating && <span>Share</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium mb-2">Share this page</div>
          <div className="flex flex-wrap gap-2">
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

            {platforms.includes('whatsapp') && (
              <SharePlatform
                platform="whatsapp"
                icon={<svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366]">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>}
                label="WhatsApp"
              />
            )}

            {platforms.includes('pinterest') && (
              <SharePlatform
                platform="pinterest"
                icon={<svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" className="text-[#E60023]">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>}
                label="Pinterest"
              />
            )}

            {platforms.includes('email') && (
              <SharePlatform
                platform="email"
                icon={<MailIcon size={iconSize} className="text-gray-600" />}
                label="Email"
              />
            )}

            {platforms.includes('copy') && (
              <SharePlatform
                platform="copy"
                icon={copied ? <Check size={iconSize} className="text-green-600" /> : <Copy size={iconSize} className="text-gray-600" />}
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

export default EnhancedSocialShare;
