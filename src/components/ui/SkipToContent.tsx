'use client';

import React from 'react';
import { cn } from '@/src/utils/cn';

interface SkipToContentProps {
  /**
   * Additional class names to apply
   */
  className?: string;

  /**
   * ID of the main content element
   * @default 'main-content'
   */
  contentId?: string;

  /**
   * Text to display in the skip link
   * @default 'Skip to main content'
   */
  text?: string;
}

/**
 * A component that provides a skip link for keyboard users to bypass navigation
 * and go directly to the main content. This is an important accessibility feature.
 */
export function SkipToContent({
  className,
  contentId = 'main-content',
  text = 'Skip to main content',
}: SkipToContentProps = {}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Find the main content element
    const mainContent = document.getElementById(contentId);

    if (mainContent) {
      // Set focus to the main content
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();

      // Remove tabindex after focus to prevent keyboard trap
      setTimeout(() => {
        mainContent.removeAttribute('tabindex');
      }, 1000);

      // Scroll to the main content
      mainContent.scrollIntoView();
    }
  };

  return (
    <a
      href={`#${contentId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded focus:shadow-lg',
        className
      )}
      onClick={handleClick}
    >
      {text}
    </a>
  );
}

export default SkipToContent;