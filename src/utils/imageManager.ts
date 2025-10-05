/**
 * Image Manager
 *
 * A central system for managing image URLs and photographer attribution.
 * This ensures consistency across the entire application.
 */

export interface UnsplashImage {
  photographer: string;
  url: string;
  alt?: string;
}

// Definitive mapping of photographers to their image URLs
const PHOTOGRAPHER_IMAGE_MAP: Record<string, string> = {
  // Original photographers
  'Arto Marttinen': 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&q=80&w=2400',
  'Davide Cantelli': 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&q=80&w=2400',
  'Thomas Tucker': 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&q=80&w=2400',
  'Sime Basioli': 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&q=80&w=2400',
  'Braden Jarvis': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&q=80&w=2400',
  'Simon Migaj': 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&q=80&w=2400',
  'Jaromir Kavan': 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&q=80&w=2400',
  'Sylvain Mauroux': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&q=80&w=2400',
  'Jakob Owens': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=2400',
  'Dino Reichmuth': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&q=80&w=2400',
  'Emile Guillemot': 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&q=80&w=2400',
  'Alonso Reyes': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=2400',
  'Asoggetti': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&q=80&w=2400',
  'Luca Bravo': 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&q=80&w=2400',
  'Cristina Gottardi': 'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&q=80&w=2400',
  'Willian West': 'https://images.unsplash.com/photo-1520466809213-7b9a56adcd45?auto=format&q=80&w=2400',
  'Shifaaz Shamoon': 'https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&q=80&w=2400',
  'Dan Gold': 'https://images.unsplash.com/photo-1565073624497-7e91b5cc3843?auto=format&q=80&w=2400',
  'Ishan Seefromthesky': 'https://images.unsplash.com/photo-1544644181-1484b3fdfc32?auto=format&q=80&w=2400',
  'Caleb Jones': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&q=80&w=2400',

  // Additional photographers from build logs
  'Test Mode': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=2400'
};

// Additional photographers to use if needed
const ADDITIONAL_PHOTOGRAPHERS: UnsplashImage[] = [
  { photographer: 'Roberto Nickson', url: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&q=80&w=2400' },
  { photographer: 'Colton Duke', url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&q=80&w=2400' },
  { photographer: 'Zach Betten', url: 'https://images.unsplash.com/photo-1467377791767-c929b5dc9a23?auto=format&q=80&w=2400' },
  { photographer: 'Yoel Peterson', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&q=80&w=2400' },
  { photographer: 'Kalen Emsley', url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&q=80&w=2400' }
];

// All available images
const ALL_IMAGES: UnsplashImage[] = [
  ...Object.entries(PHOTOGRAPHER_IMAGE_MAP).map(([photographer, url]) => ({
    photographer,
    url
  })),
  ...ADDITIONAL_PHOTOGRAPHERS
];

/**
 * Get the correct image URL for a photographer
 * @param photographer The photographer's name
 * @returns The correct image URL for the photographer
 */
export function getImageUrlForPhotographer(photographer: string): string {
  const url = PHOTOGRAPHER_IMAGE_MAP[photographer];

  if (!url) {
    // Use a fallback image without logging during build
    return PHOTOGRAPHER_IMAGE_MAP['Arto Marttinen']; // Default fallback
  }

  return url;
}

/**
 * Get the correct photographer for an image URL
 * @param url The image URL
 * @returns The correct photographer for the image URL
 */
export function getPhotographerForImageUrl(url: string): string {
  for (const [photographer, imageUrl] of Object.entries(PHOTOGRAPHER_IMAGE_MAP)) {
    if (imageUrl === url) {
      return photographer;
    }
  }

  // Use a fallback photographer without logging during build
  return 'Arto Marttinen'; // Default fallback
}

/**
 * Validate and correct image data
 * @param imageUrl The image URL
 * @param photographer The photographer's name
 * @param silent Whether to suppress warnings (default: true)
 * @returns Corrected image data
 */
export function validateAndCorrectImageData(
  imageUrl?: string,
  photographer?: string,
  silent: boolean = true
): UnsplashImage {
  // Import the logger dynamically to avoid circular dependencies
  const logWarning = (message: string, context?: Record<string, any>) => {
    if (silent) return;

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[ImageManager] ${message}`, context);
    } else {
      // In production, only log to console if not silent
      if (!silent) {
        console.debug(`[ImageManager] ${message}`);
      }
    }
  };

  try {
    // If we have both, check if they match
    if (imageUrl && photographer) {
      const correctUrl = getImageUrlForPhotographer(photographer);

      // If the URL doesn't match the photographer, use the correct URL
      if (correctUrl && imageUrl !== correctUrl) {
        // Log the correction if not silent
        logWarning(`Corrected image URL for photographer ${photographer}`, {
          originalUrl: imageUrl,
          correctedUrl: correctUrl
        });

        return { photographer, url: correctUrl };
      }

      // If we have a valid pair, return it
      if (correctUrl) {
        return { photographer, url: correctUrl };
      }
    }

    // If we only have the photographer, get the correct URL
    if (photographer && !imageUrl) {
      const url = getImageUrlForPhotographer(photographer);
      return { photographer, url };
    }

    // If we only have the URL, get the correct photographer
    if (imageUrl && !photographer) {
      const photographer = getPhotographerForImageUrl(imageUrl);
      return { photographer, url: imageUrl };
    }

    // If we have neither, return a random image
    logWarning('No image data provided, using random image');
    return getRandomImage();
  } catch (_error) {
    // Log the error if not silent
    logWarning('Error validating image data, using random image', {
      error,
      imageUrl,
      photographer
    });

    // Return a random image as a fallback
    return getRandomImage();
  }
}

/**
 * Get a random image
 * @param excludeUrls Optional array of image URLs to exclude
 * @returns A random image that's not in the excluded list
 */
export function getRandomImage(excludeUrls: string[] = []): UnsplashImage {
  // Filter out excluded images
  const availableImages = ALL_IMAGES.filter(img => !excludeUrls.includes(img.url));

  // If all images are excluded (unlikely but possible), return a random one anyway
  if (availableImages.length === 0) {
    const randomIndex = Math.floor(Math.random() * ALL_IMAGES.length);
    return ALL_IMAGES[randomIndex];
  }

  // Return a random image from the available ones
  const randomIndex = Math.floor(Math.random() * availableImages.length);
  return availableImages[randomIndex];
}

/**
 * Get a random image for a category
 * @param category The category
 * @param excludeUrls Optional array of image URLs to exclude
 * @returns A random image appropriate for the category that's not in the excluded list
 */
export function getRandomImageForCategory(category: string, excludeUrls: string[] = []): UnsplashImage {
  // In a real implementation, we would have category-specific images
  // For now, we'll just return a random image
  return getRandomImage(excludeUrls);
}

/**
 * Get an alternative image for a photographer
 * @param photographer The photographer to find an alternative for
 * @param excludeUrls Optional array of image URLs to exclude
 * @returns An alternative image by a different photographer
 */
export function getAlternativeImage(photographer: string, excludeUrls: string[] = []): UnsplashImage {
  // Get all photographers except the current one
  const otherPhotographers = Object.keys(PHOTOGRAPHER_IMAGE_MAP).filter(p => p !== photographer);

  // If there are no other photographers (unlikely), return a random image
  if (otherPhotographers.length === 0) {
    return getRandomImage(excludeUrls);
  }

  // Filter out photographers whose images are in the excluded list
  const availablePhotographers = otherPhotographers.filter(p => {
    const url = PHOTOGRAPHER_IMAGE_MAP[p];
    return !excludeUrls.includes(url);
  });

  // If all alternatives are excluded, return a random image
  if (availablePhotographers.length === 0) {
    return getRandomImage(excludeUrls);
  }

  // Pick a random photographer from the available ones
  const randomIndex = Math.floor(Math.random() * availablePhotographers.length);
  const selectedPhotographer = availablePhotographers[randomIndex];

  // Return the image for this photographer
  return {
    photographer: selectedPhotographer,
    url: PHOTOGRAPHER_IMAGE_MAP[selectedPhotographer]
  };
}

const imageManager = {
  getImageUrlForPhotographer,
  getPhotographerForImageUrl,
  validateAndCorrectImageData,
  getRandomImage,
  getRandomImageForCategory,
  getAlternativeImage
};

export default imageManager;
