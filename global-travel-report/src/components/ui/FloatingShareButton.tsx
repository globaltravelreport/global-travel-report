'use client';

import React, { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import { ShareButtons } from './ShareButtons';

interface FloatingShareButtonProps {
  url: string;
  title: string;
  description?: string;
}

/**
 * Floating share button that appears when scrolling down on mobile devices
 */
export function FloatingShareButton({ url, title, description }: FloatingShareButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Show the button when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      // Only show after scrolling down 300px
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide the share panel when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.floating-share-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="floating-share-container fixed bottom-6 right-6 z-50 md:hidden">
      {/* Share panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-4 mb-2 border">
          <h3 className="text-sm font-medium mb-3 text-center">Share this story</h3>
          <ShareButtons
            url={url}
            title={title}
            description={description}
            iconSize={36}
          />
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#19273A] text-[#C9A14A] rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-[#2a3b52] transition-colors"
        aria-label="Share this story"
      >
        <Share2 size={20} />
      </button>
    </div>
  );
}

export default FloatingShareButton;
