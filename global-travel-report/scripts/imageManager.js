/**
 * Image Manager
 *
 * A central system for managing image URLs and photographer attribution.
 * This ensures consistency across the entire application.
 */

// Definitive mapping of photographers to their image URLs
const PHOTOGRAPHER_IMAGE_MAP = {
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
  'Caleb Jones': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&q=80&w=2400'
};

// Additional photographers to use if needed
const ADDITIONAL_PHOTOGRAPHERS = [
  { photographer: 'Roberto Nickson', url: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&q=80&w=2400' },
  { photographer: 'Colton Duke', url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&q=80&w=2400' },
  { photographer: 'Zach Betten', url: 'https://images.unsplash.com/photo-1467377791767-c929b5dc9a23?auto=format&q=80&w=2400' },
  { photographer: 'Yoel Peterson', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&q=80&w=2400' },
  { photographer: 'Kalen Emsley', url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&q=80&w=2400' }
];

/**
 * Get the correct image URL for a photographer
 * @param {string} photographer The photographer's name
 * @returns {string} The correct image URL for the photographer
 */
function getImageUrlForPhotographer(photographer) {
  const url = PHOTOGRAPHER_IMAGE_MAP[photographer];

  if (!url) {
    console.warn(`Unknown photographer: ${photographer}. Using fallback image.`);
    return PHOTOGRAPHER_IMAGE_MAP['Arto Marttinen']; // Default fallback
  }

  return url;
}

/**
 * Get the correct photographer for an image URL
 * @param {string} url The image URL
 * @returns {string} The correct photographer for the image URL
 */
function getPhotographerForImageUrl(url) {
  for (const [photographer, imageUrl] of Object.entries(PHOTOGRAPHER_IMAGE_MAP)) {
    if (imageUrl === url) {
      return photographer;
    }
  }

  console.warn(`Unknown image URL: ${url}. Using fallback photographer.`);
  return 'Arto Marttinen'; // Default fallback
}

/**
 * Validate and correct image data
 * @param {string} imageUrl The image URL
 * @param {string} photographer The photographer's name
 * @returns {Object} Corrected image data
 */
function validateAndCorrectImageData(imageUrl, photographer) {
  // If we have both, check if they match
  if (imageUrl && photographer) {
    const correctUrl = getImageUrlForPhotographer(photographer);

    // If the URL doesn't match the photographer, use the correct URL
    if (correctUrl && imageUrl !== correctUrl) {
      console.log(`Image URL ${imageUrl} doesn't match photographer ${photographer}. Using correct URL ${correctUrl}`);
      return { url: correctUrl, photographer };
    }

    // If we have a valid pair, return it
    if (correctUrl) {
      return { url: correctUrl, photographer };
    }
  }

  // If we only have the photographer, get the correct URL
  if (photographer && !imageUrl) {
    const url = getImageUrlForPhotographer(photographer);
    return { url, photographer };
  }

  // If we only have the URL, get the correct photographer
  if (imageUrl && !photographer) {
    const photographer = getPhotographerForImageUrl(imageUrl);
    return { url: imageUrl, photographer };
  }

  // If we have neither, return a random image
  const randomPhotographer = getRandomPhotographer();
  const randomUrl = getImageUrlForPhotographer(randomPhotographer);
  return { url: randomUrl, photographer: randomPhotographer };
}

/**
 * Get a random photographer
 * @returns {string} A random photographer
 */
function getRandomPhotographer() {
  const photographers = Object.keys(PHOTOGRAPHER_IMAGE_MAP);
  const randomIndex = Math.floor(Math.random() * photographers.length);
  return photographers[randomIndex];
}

/**
 * Get an alternative image for a photographer
 * @param {string} photographer The photographer to find an alternative for
 * @param {string[]} excludeUrls Optional array of image URLs to exclude
 * @returns {Object} An alternative image by a different photographer
 */
function getAlternativeImage(photographer, excludeUrls = []) {
  // Get all photographers except the current one
  const otherPhotographers = Object.keys(PHOTOGRAPHER_IMAGE_MAP).filter(p => p !== photographer);

  // If there are no other photographers (unlikely), return a random one
  if (otherPhotographers.length === 0) {
    const randomPhotographer = getRandomPhotographer();
    return {
      photographer: randomPhotographer,
      url: PHOTOGRAPHER_IMAGE_MAP[randomPhotographer]
    };
  }

  // Filter out photographers whose images are in the excluded list
  const availablePhotographers = otherPhotographers.filter(p => {
    const url = PHOTOGRAPHER_IMAGE_MAP[p];
    return !excludeUrls.includes(url);
  });

  // If all alternatives are excluded, return a random photographer
  if (availablePhotographers.length === 0) {
    const randomPhotographer = getRandomPhotographer();
    return {
      photographer: randomPhotographer,
      url: PHOTOGRAPHER_IMAGE_MAP[randomPhotographer]
    };
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

module.exports = {
  getImageUrlForPhotographer,
  getPhotographerForImageUrl,
  validateAndCorrectImageData,
  getRandomPhotographer,
  getAlternativeImage,
  PHOTOGRAPHER_IMAGE_MAP
};
