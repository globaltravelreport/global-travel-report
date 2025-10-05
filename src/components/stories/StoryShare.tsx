'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, SocialIcon } from '@/components/ui/icons';

interface StoryShareProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  variant?: 'default' | 'compact' | 'floating' | 'inline';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  showLabels?: boolean;
  showCounts?: boolean;
  theme?: 'light' | 'dark';
}

export default function StoryShare({
  title,
  description = '',
  url,
  imageUrl,
  variant = 'default',
  position = 'bottom',
  className = '',
  showLabels = true,
  showCounts = false,
  theme = 'light',
}: StoryShareProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get current URL if not provided
    if (!url) {
      setShareUrl(window.location.href);
    } else {
      setShareUrl(url);
    }

    // Load share counts if enabled
    if (showCounts) {
      loadShareCounts();
    }
  }, [url, showCounts]);

  const loadShareCounts = async () => {
    try {
      // This would typically call your analytics API or social media APIs
      // For now, we'll use mock data
      const mockCounts = {
        facebook: Math.floor(Math.random() * 100),
        twitter: Math.floor(Math.random() * 50),
        linkedin: Math.floor(Math.random() * 25),
        whatsapp: Math.floor(Math.random() * 30),
      };
      setShareCounts(mockCounts);
    } catch (_error) {
      console.error('Error loading share counts:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      setIsLoading(true);
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (_error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could show a toast notification here
      console.log('Link copied to clipboard');
    } catch (_error) {
      console.error('Failed to copy link:', error);
    }
  };

  const getShareLinks = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    };
  };

  const shareLinks = getShareLinks();

  const handleSocialShare = (platform: string) => {
    const link = shareLinks[platform as keyof typeof shareLinks];
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  // Floating variant for scroll-based visibility
  useEffect(() => {
    if (variant !== 'floating') return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 300; // Show after scrolling 300px
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant]);

  const baseClasses = `
    ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
    ${variant === 'floating' ? 'fixed z-50 shadow-lg rounded-full p-2' : 'rounded-lg p-4'}
    ${className}
  `;

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return variant === 'floating' ? 'top-4 right-4' : '';
      case 'bottom':
        return variant === 'floating' ? 'bottom-4 right-4' : '';
      case 'left':
        return variant === 'floating' ? 'top-1/2 left-4 -translate-y-1/2' : '';
      case 'right':
        return variant === 'floating' ? 'top-1/2 right-4 -translate-y-1/2' : '';
      default:
        return '';
    }
  };

  if (variant === 'floating' && !isVisible) {
    return null;
  }

  const containerClasses = `
    ${baseClasses}
    ${getPositionClasses()}
    ${variant === 'floating' ? 'transition-all duration-300' : ''}
  `;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={() => handleSocialShare('facebook')}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="Share on Facebook"
        >
          <Icon name="facebook" size={20} className="text-blue-600" />
        </button>
        <button
          onClick={() => handleSocialShare('twitter')}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="Share on Twitter"
        >
          <Icon name="twitter" size={20} className="text-blue-400" />
        </button>
        <button
          onClick={() => handleSocialShare('linkedin')}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="Share on LinkedIn"
        >
          <Icon name="linkedin" size={20} className="text-blue-700" />
        </button>
        <button
          onClick={() => handleSocialShare('whatsapp')}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="Share on WhatsApp"
        >
          <Icon name="whatsapp" size={20} className="text-green-600" />
        </button>
        <button
          onClick={handleCopyLink}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="Copy link"
        >
          <Icon name="share" size={16} />
        </button>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center justify-center space-x-4 py-2 ${className}`}>
        <span className="text-sm font-medium">Share:</span>
        <button
          onClick={() => handleSocialShare('facebook')}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          title="Share on Facebook"
        >
          <Icon name="facebook" size={24} className="text-blue-600" />
        </button>
        <button
          onClick={() => handleSocialShare('twitter')}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          title="Share on Twitter"
        >
          <Icon name="twitter" size={24} className="text-blue-400" />
        </button>
        <button
          onClick={() => handleSocialShare('linkedin')}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          title="Share on LinkedIn"
        >
          <Icon name="linkedin" size={24} className="text-blue-700" />
        </button>
        <button
          onClick={() => handleSocialShare('whatsapp')}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
          title="Share on WhatsApp"
        >
          <Icon name="whatsapp" size={24} className="text-green-600" />
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={containerClasses}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Icon name="share" size={20} />
            <span className="font-medium text-sm">Share this story</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Facebook */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSocialShare('facebook')}
              className="flex items-center space-x-1 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              title="Share on Facebook"
            >
              <Icon name="facebook" size={20} className="text-blue-600" />
              {showLabels && <span className="text-sm hidden sm:inline">Facebook</span>}
              {showCounts && shareCounts.facebook > 0 && (
                <span className="text-xs bg-gray-100 px-1 rounded">
                  {shareCounts.facebook}
                </span>
              )}
            </motion.button>

            {/* Twitter */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSocialShare('twitter')}
              className="flex items-center space-x-1 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              title="Share on Twitter"
            >
              <Icon name="twitter" size={20} className="text-blue-400" />
              {showLabels && <span className="text-sm hidden sm:inline">Twitter</span>}
              {showCounts && shareCounts.twitter > 0 && (
                <span className="text-xs bg-gray-100 px-1 rounded">
                  {shareCounts.twitter}
                </span>
              )}
            </motion.button>

            {/* LinkedIn */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSocialShare('linkedin')}
              className="flex items-center space-x-1 p-2 rounded-lg hover:bg-blue-50 transition-colors"
              title="Share on LinkedIn"
            >
              <Icon name="linkedin" size={20} className="text-blue-700" />
              {showLabels && <span className="text-sm hidden sm:inline">LinkedIn</span>}
              {showCounts && shareCounts.linkedin > 0 && (
                <span className="text-xs bg-gray-100 px-1 rounded">
                  {shareCounts.linkedin}
                </span>
              )}
            </motion.button>

            {/* WhatsApp */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSocialShare('whatsapp')}
              className="flex items-center space-x-1 p-2 rounded-lg hover:bg-green-50 transition-colors"
              title="Share on WhatsApp"
            >
              <Icon name="whatsapp" size={20} className="text-green-600" />
              {showLabels && <span className="text-sm hidden sm:inline">WhatsApp</span>}
              {showCounts && shareCounts.whatsapp > 0 && (
                <span className="text-xs bg-gray-100 px-1 rounded">
                  {shareCounts.whatsapp}
                </span>
              )}
            </motion.button>

            {/* Email */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSocialShare('email')}
              className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              title="Share via Email"
            >
              <Icon name="mail" size={20} className="text-gray-600" />
              {showLabels && <span className="text-sm hidden sm:inline">Email</span>}
            </motion.button>

            {/* Copy Link */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyLink}
              className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              title="Copy Link"
            >
              <Icon name="share" size={20} className="text-gray-600" />
              {showLabels && <span className="text-sm hidden sm:inline">Copy</span>}
            </motion.button>

            {/* Native Share (mobile) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNativeShare}
                disabled={isLoading}
                className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="More sharing options"
              >
                <Icon name="share" size={20} className="text-gray-600" />
                {showLabels && <span className="text-sm hidden sm:inline">More</span>}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Floating share button for mobile
export function FloatingShareButton({
  title,
  description,
  url,
  className = '',
}: Pick<StoryShareProps, 'title' | 'description' | 'url' | 'className'>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors ${className}`}
      >
        <Icon name="share" size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-6 z-40 bg-white rounded-lg shadow-xl p-4 border"
          >
            <StoryShare
              title={title}
              description={description}
              url={url}
              variant="compact"
              showLabels={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 bg-black bg-opacity-25"
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Hook for share functionality
export function useShare() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(!!navigator.share);
  }, []);

  const share = async (data: ShareData) => {
    if (navigator.share) {
      await navigator.share(data);
      return;
    }
    throw new Error('Web Share API not supported');
  };

  return { isSupported, share };
}