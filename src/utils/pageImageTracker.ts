/**
 * Page Image Tracker
 * 
 * This utility tracks which images have been used on a page to prevent duplicates.
 * It maintains a global registry of used images per page render and provides
 * functions to check if an image has been used and to mark an image as used.
 */

// Track used images per page render
// This is reset on each page load
const usedImagesOnPage = new Set<string>();

/**
 * Check if an image URL has been used on the current page
 * @param imageUrl The image URL to check
 * @returns True if the image has been used, false otherwise
 */
export function isImageUsedOnPage(imageUrl: string): boolean {
  return usedImagesOnPage.has(imageUrl);
}

/**
 * Mark an image URL as used on the current page
 * @param imageUrl The image URL to mark as used
 */
export function markImageAsUsed(imageUrl: string): void {
  usedImagesOnPage.add(imageUrl);
}

/**
 * Get all used image URLs on the current page
 * @returns Array of used image URLs
 */
export function getUsedImagesOnPage(): string[] {
  return Array.from(usedImagesOnPage);
}

/**
 * Clear the used images registry
 * This should be called when navigating to a new page
 */
export function clearUsedImages(): void {
  usedImagesOnPage.clear();
}

/**
 * Reset the used images registry on client-side navigation
 * This is automatically called when the component is mounted on the client
 */
export function setupPageImageTracker(): void {
  if (typeof window !== 'undefined') {
    // Clear the registry when the page is loaded
    clearUsedImages();
    
    // Add event listener for route changes
    window.addEventListener('routeChangeStart', clearUsedImages);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('routeChangeStart', clearUsedImages);
    };
  }
}

export default {
  isImageUsedOnPage,
  markImageAsUsed,
  getUsedImagesOnPage,
  clearUsedImages,
  setupPageImageTracker
};
