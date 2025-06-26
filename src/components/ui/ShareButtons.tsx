'use client';

import React from 'react';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  LinkedinShareButton, 
  WhatsappShareButton, 
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  EmailIcon
} from 'next-share';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  iconSize?: number;
  round?: boolean;
  vertical?: boolean;
}

/**
 * Social media sharing buttons component
 * 
 * @param url - The URL to share
 * @param title - The title to share
 * @param description - The description to share (optional)
 * @param className - Additional CSS classes (optional)
 * @param iconSize - Size of the social media icons (default: 32)
 * @param round - Whether to use round icons (default: true)
 * @param vertical - Whether to display buttons vertically (default: false)
 */
export function ShareButtons({
  url,
  title,
  description = '',
  className = '',
  iconSize = 32,
  round = true,
  vertical = false
}: ShareButtonsProps) {
  // Ensure we have the full URL
  const fullUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com'}${url}`;
  
  // Handle copy to clipboard
  const copyToClipboard = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl)
        .then(() => {
          toast.success('Link copied to clipboard!');
        })
        .catch(() => {
          toast.error('Failed to copy link');
        });
    } else {
      toast.error('Clipboard not available');
    }
  };

  return (
    <div className={`flex ${vertical ? 'flex-col space-y-2' : 'flex-row space-x-2'} items-center ${className}`}>
      <FacebookShareButton url={fullUrl} quote={title}>
        <FacebookIcon size={iconSize} round={round} />
      </FacebookShareButton>

      <TwitterShareButton url={fullUrl} title={title}>
        <TwitterIcon size={iconSize} round={round} />
      </TwitterShareButton>

      <LinkedinShareButton url={fullUrl} title={title} summary={description}>
        <LinkedinIcon size={iconSize} round={round} />
      </LinkedinShareButton>

      <WhatsappShareButton url={fullUrl} title={title} separator=" - ">
        <WhatsappIcon size={iconSize} round={round} />
      </WhatsappShareButton>

      <EmailShareButton url={fullUrl} subject={title} body={`Check out this article: ${title}\n\n${description}\n\n${fullUrl}`}>
        <EmailIcon size={iconSize} round={round} />
      </EmailShareButton>

      <button 
        onClick={copyToClipboard}
        className={`flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors rounded-full w-[${iconSize}px] h-[${iconSize}px]`}
        style={{ width: iconSize, height: iconSize }}
        aria-label="Copy link to clipboard"
      >
        <Copy size={iconSize * 0.5} />
      </button>
    </div>
  );
}

export default ShareButtons;
