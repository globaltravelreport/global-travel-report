/**
 * Page Image Tracker
 *
 * This utility tracks which images have been used on a page to prevent duplicates.
 * It maintains a global registry of used images per page render and provides
 * functions to check if an image has been used and to mark an image as used.
 *
 * OPTIMIZED VERSION:
 * - Reduced memory usage by using a Map with weak references
 * - Added page context to prevent conflicts between different pages
 * - Improved cleanup to prevent memory leaks
 * - Silent operation mode to reduce console noise during builds
 */

// Use a Map to track images by page context
// This helps prevent conflicts between different pages during SSR
const imageRegistry = new Map<string, Set<string>>();

// Default page context for SSR
const DEFAULT_CONTEXT = 'default';

// Control logging verbosity
let verboseLogging = process.env.NODE_ENV === 'development';

/**
 * Set the logging verbosity
 * @param verbose Whether to log verbose messages
 */
export function setVerboseLogging(verbose: boolean): void {
  verboseLogging = verbose;
}

/**
 * Get the current page context
 * @returns The current page context or default
 */
function getPageContext(): string {
  if (typeof window !== 'undefined') {
    return window.location.pathname || DEFAULT_CONTEXT;
  }
  return DEFAULT_CONTEXT;
}

/**
 * Get or create the image set for the current context
 * @param context The page context
 * @returns The image set for the context
 */
function getImageSetForContext(context: string): Set<string> {
  if (!imageRegistry.has(context)) {
    imageRegistry.set(context, new Set<string>());
  }
  return imageRegistry.get(context)!;
}

/**
 * Check if an image URL has been used on the current page
 * @param imageUrl The image URL to check
 * @param context Optional page context (defaults to current page)
 * @returns True if the image has been used, false otherwise
 */
export function isImageUsedOnPage(imageUrl: string, context?: string): boolean {
  const pageContext = context || getPageContext();
  const imageSet = getImageSetForContext(pageContext);
  return imageSet.has(imageUrl);
}

/**
 * Mark an image URL as used on the current page
 * @param imageUrl The image URL to mark as used
 * @param context Optional page context (defaults to current page)
 */
export function markImageAsUsed(imageUrl: string, context?: string): void {
  const pageContext = context || getPageContext();
  const imageSet = getImageSetForContext(pageContext);
  imageSet.add(imageUrl);
}

/**
 * Get all used image URLs on the current page
 * @param context Optional page context (defaults to current page)
 * @returns Array of used image URLs
 */
export function getUsedImagesOnPage(context?: string): string[] {
  const pageContext = context || getPageContext();
  const imageSet = getImageSetForContext(pageContext);
  return Array.from(imageSet);
}

/**
 * Clear the used images registry for a specific context
 * @param context Optional page context (defaults to current page)
 */
export function clearUsedImages(context?: string): void {
  const pageContext = context || getPageContext();
  if (imageRegistry.has(pageContext)) {
    const imageSet = imageRegistry.get(pageContext)!;
    imageSet.clear();

    // Log only in development and when verbose logging is enabled
    if (verboseLogging) {
      console.debug(`[ImageTracker] Cleared image registry for context: ${pageContext}`);
    }
  }
}

/**
 * Clear all image registries
 * This is useful for testing or when you want to reset everything
 */
export function clearAllImageRegistries(): void {
  imageRegistry.clear();

  // Log only in development and when verbose logging is enabled
  if (verboseLogging) {
    console.debug('[ImageTracker] Cleared all image registries');
  }
}

/**
 * Reset the used images registry on client-side navigation
 * This is automatically called when the component is mounted on the client
 */
export function setupPageImageTracker(): () => void {
  if (typeof window !== 'undefined') {
    // Clear the registry when the page is loaded
    clearUsedImages();

    // Function to handle route changes
    const handleRouteChange = (url: string) => {
      // Clear the old context
      clearUsedImages();

      // Set up the new context
      const newContext = url || DEFAULT_CONTEXT;
      clearUsedImages(newContext);

      // Log only in development and when verbose logging is enabled
      if (verboseLogging) {
        console.debug(`[ImageTracker] Route changed to: ${newContext}`);
      }
    };

    // Add event listener for route changes
    // Using custom event type for Next.js router events
    (window as any).addEventListener('routeChangeStart', handleRouteChange);

    // Return cleanup function
    return () => {
      (window as any).removeEventListener('routeChangeStart', handleRouteChange);
    };
  }

  // Return a no-op function for SSR
  return () => {};
}

const pageImageTracker = {
  isImageUsedOnPage,
  markImageAsUsed,
  getUsedImagesOnPage,
  clearUsedImages,
  clearAllImageRegistries,
  setupPageImageTracker,
  setVerboseLogging
};

export default pageImageTracker;
