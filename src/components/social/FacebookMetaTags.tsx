'use client';

import { useEffect } from 'react';

interface FacebookMetaTagsProps {
  appId: string;
  url?: string;
}

/**
 * Component that adds Facebook meta tags directly to the document head
 * This is a client-side component that will run after hydration
 */
export function FacebookMetaTags({ appId, url }: FacebookMetaTagsProps) {
  useEffect(() => {
    // Check if the meta tags already exist
    const existingAppIdTag = document.querySelector('meta[property="fb:app_id"]');
    const existingUrlTag = document.querySelector('meta[property="og:url"]');

    // If the app ID tag doesn't exist, create it
    if (!existingAppIdTag) {
      const appIdTag = document.createElement('meta');
      appIdTag.setAttribute('property', 'fb:app_id');
      appIdTag.setAttribute('content', appId);
      document.head.appendChild(appIdTag);
    }

    // If the URL is provided and the og:url tag doesn't exist, create it
    if (url && !existingUrlTag) {
      const urlTag = document.createElement('meta');
      urlTag.setAttribute('property', 'og:url');
      urlTag.setAttribute('content', url);
      document.head.appendChild(urlTag);
    }

    // Cleanup function to remove the tags when the component unmounts
    return () => {
      // Only remove tags that we added
      const appIdTag = document.querySelector('meta[property="fb:app_id"]');
      const urlTag = document.querySelector('meta[property="og:url"]');

      if (appIdTag && !existingAppIdTag) {
        document.head.removeChild(appIdTag);
      }

      if (urlTag && !existingUrlTag && url) {
        document.head.removeChild(urlTag);
      }
    };
  }, [appId, url]);

  // This component doesn't render anything
  return null;
}
