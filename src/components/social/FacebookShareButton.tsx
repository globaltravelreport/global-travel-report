'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FacebookIcon } from '@/components/ui/icons';

interface FacebookShareButtonProps {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A button that shares content on Facebook using the Facebook SDK
 */
export function FacebookShareButton({
  url,
  title,
  description,
  imageUrl,
  className = '',
  children,
}: FacebookShareButtonProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleShare = () => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.ui({
        method: 'share',
        href: url,
      });
    } else {
      // Fallback if FB SDK is not loaded
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${className}`}
      onClick={handleShare}
      aria-label="Share on Facebook"
    >
      {children ? (
        children
      ) : (
        <>
          <FacebookIcon className="h-4 w-4" />
          <span>Share</span>
        </>
      )}
    </Button>
  );
}

// Add this to global.d.ts
declare global {
  interface Window {
    FB?: {
      ui: (options: any) => void;
      init: (options: any) => void;
    };
  }
}
