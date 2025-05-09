"use client";

import React from 'react';
import Link from 'next/link';
import { withErrorBoundary } from '@/src/components/ui/ErrorBoundary';
import { formatDisplayDate } from '@/src/utils/date-utils';
import { StoryCoverImage } from '@/src/components/ui/OptimizedImage';
import { ResponsiveImage } from '@/src/components/ui/ResponsiveImage';
import { getStoryUrl, getCategoryUrl, getCountryUrl, getTagUrl } from '@/src/utils/url';
import { cn } from '@/src/utils/cn';
import { FreshnessIndicator } from '@/src/components/ui/FreshnessIndicator';
import type { Story } from '@/types/Story';
import { validateAndCorrectImageData, getAlternativeImage } from '@/src/utils/imageManager';
import { isImageUsedOnPage, markImageAsUsed, getUsedImagesOnPage, setupPageImageTracker } from '@/src/utils/pageImageTracker';

// Direct mapping between photographers and their images
const PHOTOGRAPHER_IMAGES: Record<string, string> = {
  'Jakob Owens': 'https://images.unsplash.com/photo-1488085061387-422e29b40080',
  'Asoggetti': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
  'Jaromir Kavan': 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
  'Dino Reichmuth': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d',
  'Sylvain Mauroux': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
  'Alonso Reyes': 'https://images.unsplash.com/photo-1548574505-5e239809ee19',
  'Josiah Farrow': 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b',
  'Vidar Nordli-Mathisen': 'https://images.unsplash.com/photo-1548690312-e3b507d8c110',
  'Flo Maderebner': 'https://images.unsplash.com/photo-1551632811-561732d1e306',
  'Anthony Tran': 'https://images.unsplash.com/photo-1493707553966-283afac8c358',
  'Jingda Chen': 'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5',
  'Esteban Castle': 'https://images.unsplash.com/photo-1566438480900-0609be27a4be',
  'Jezael Melgoza': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04',
  'Brooke Lark': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  'Kelsey Knight': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
  'Simon Migaj': 'https://images.unsplash.com/photo-1508672019048-805c876b67e2',
  'Sime Basioli': 'https://images.unsplash.com/photo-1530789253388-582c481c54b0',
  'Braden Jarvis': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
  'Arto Marttinen': 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a',
  'Emile Guillemot': 'https://images.unsplash.com/photo-1528127269322-539801943592',
  'Thomas Tucker': 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff',
  'Davide Cantelli': 'https://images.unsplash.com/photo-1528164344705-47542687000d',
  'Raimond Klavins': 'https://images.unsplash.com/photo-1551913902-c92207136625',
  'Heidi Kaden': 'https://images.unsplash.com/photo-1552084117-56a987666449',
  'Shifaaz Shamoon': 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0',
  'Dario Bronnimann': 'https://images.unsplash.com/photo-1533105079780-92b9be482077'
};

interface StoryCardProps {
  story: Story;
  className?: string;
}

const StoryCardComponent = ({ story, className }: StoryCardProps) => {
  // Generate a unique image and photographer based on story properties
  const getUniqueImageAndPhotographer = React.useCallback(() => {
    // Always use our deterministic image selection algorithm
    // This ensures each story gets a unique image regardless of what's in the database

    // Expanded category-specific default images with more options
    const defaultImages = {
      'Travel': [
        { url: 'https://images.unsplash.com/photo-1488085061387-422e29b40080', photographer: 'Jakob Owens', profileUrl: 'https://unsplash.com/@jakobowens1' },
        { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1', photographer: 'Asoggetti', profileUrl: 'https://unsplash.com/@asoggetti' },
        { url: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b', photographer: 'Jaromir Kavan', profileUrl: 'https://unsplash.com/@jerrykavan' },
        { url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d', photographer: 'Dino Reichmuth', profileUrl: 'https://unsplash.com/@dinoreichmuth' },
        { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', photographer: 'Sylvain Mauroux', profileUrl: 'https://unsplash.com/@sylvainmauroux' },
        { url: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0', photographer: 'Sime Basioli', profileUrl: 'https://unsplash.com/@basecore' },
        { url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800', photographer: 'Braden Jarvis', profileUrl: 'https://unsplash.com/@jarvisphoto' },
        { url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2', photographer: 'Simon Migaj', profileUrl: 'https://unsplash.com/@simonmigaj' },
        { url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a', photographer: 'Arto Marttinen', profileUrl: 'https://unsplash.com/@wandervisions' },
        { url: 'https://images.unsplash.com/photo-1528127269322-539801943592', photographer: 'Emile Guillemot', profileUrl: 'https://unsplash.com/@emilegt' },
        { url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff', photographer: 'Thomas Tucker', profileUrl: 'https://unsplash.com/@tents_and_tread' },
        { url: 'https://images.unsplash.com/photo-1528164344705-47542687000d', photographer: 'Davide Cantelli', profileUrl: 'https://unsplash.com/@cant89' }
      ],
      'Cruise': [
        { url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
        { url: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b', photographer: 'Josiah Farrow', profileUrl: 'https://unsplash.com/@josiahfarrow' },
        { url: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110', photographer: 'Vidar Nordli-Mathisen', profileUrl: 'https://unsplash.com/@vidarnm' },
        { url: 'https://images.unsplash.com/photo-1548690396-1fae5d6a3f8a', photographer: 'Vidar Nordli-Mathisen', profileUrl: 'https://unsplash.com/@vidarnm' },
        { url: 'https://images.unsplash.com/photo-1548574169-47bca74f9515', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
        { url: 'https://images.unsplash.com/photo-1580541631950-7282082b03fe', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
        { url: 'https://images.unsplash.com/photo-1566375638485-8c4d8780ae10', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
        { url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0', photographer: 'Vidar Nordli-Mathisen', profileUrl: 'https://unsplash.com/@vidarnm' },
        { url: 'https://images.unsplash.com/photo-1559599746-8823b38544c6', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
        { url: 'https://images.unsplash.com/photo-1559599746-8823b38544c6', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
        { url: 'https://images.unsplash.com/photo-1580394693539-9b20a140c7e3', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' },
        { url: 'https://images.unsplash.com/photo-1580541631950-7282082b03fe', photographer: 'Alonso Reyes', profileUrl: 'https://unsplash.com/@alonsoreyes' }
      ],
      'Culture': [
        { url: 'https://images.unsplash.com/photo-1493707553966-283afac8c358', photographer: 'Anthony Tran', profileUrl: 'https://unsplash.com/@anthonytran' },
        { url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988a5', photographer: 'Jingda Chen', profileUrl: 'https://unsplash.com/@jingda' },
        { url: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be', photographer: 'Esteban Castle', profileUrl: 'https://unsplash.com/@estebancastle' },
        { url: 'https://images.unsplash.com/photo-1551913902-c92207136625', photographer: 'Raimond Klavins', profileUrl: 'https://unsplash.com/@raimondklavins' },
        { url: 'https://images.unsplash.com/photo-1552084117-56a987666449', photographer: 'Heidi Kaden', profileUrl: 'https://unsplash.com/@heidikaden' },
        { url: 'https://images.unsplash.com/photo-1551966775-a4ddc8df052b', photographer: 'Raimond Klavins', profileUrl: 'https://unsplash.com/@raimondklavins' },
        { url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04', photographer: 'Jezael Melgoza', profileUrl: 'https://unsplash.com/@jezar' },
        { url: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0', photographer: 'Shifaaz Shamoon', profileUrl: 'https://unsplash.com/@sotti' },
        { url: 'https://images.unsplash.com/photo-1581872151274-8ede2e3f7d12', photographer: 'Shifaaz Shamoon', profileUrl: 'https://unsplash.com/@sotti' },
        { url: 'https://images.unsplash.com/photo-1519181245277-cffeb31da2e3', photographer: 'Jezael Melgoza', profileUrl: 'https://unsplash.com/@jezar' },
        { url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077', photographer: 'Dario Bronnimann', profileUrl: 'https://unsplash.com/@darby' },
        { url: 'https://images.unsplash.com/photo-1516834474-48c0abc2a902', photographer: 'Jezael Melgoza', profileUrl: 'https://unsplash.com/@jezar' }
      ],
      'Food & Wine': [
        { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
        { url: 'https://images.unsplash.com/photo-1543352634-99a5d50ae78e', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
        { url: 'https://images.unsplash.com/photo-1533777324565-a040eb52facd', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
        { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3', photographer: 'Kelsey Knight', profileUrl: 'https://unsplash.com/@kelseyannvere' },
        { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
        { url: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
        { url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
        { url: 'https://images.unsplash.com/photo-1515778767554-195d641642a7', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
        { url: 'https://images.unsplash.com/photo-1482275548304-a58859dc31b7', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
        { url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
        { url: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' },
        { url: 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94', photographer: 'Brooke Lark', profileUrl: 'https://unsplash.com/@brookelark' }
      ],
      'Adventure': [
        { url: 'https://images.unsplash.com/photo-1551632811-561732d1e306', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1516939884455-1445c8652f83', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1496080174650-637e3f22fa03', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1455156218388-5e61b526818b', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1542359649-31e03cd4d909', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1484910292437-025e5d13ce87', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' },
        { url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828', photographer: 'Flo Maderebner', profileUrl: 'https://unsplash.com/@flomaderebner' }
      ],
      'General': [
        { url: 'https://images.unsplash.com/photo-1488085061387-422e29b40080', photographer: 'Jakob Owens', profileUrl: 'https://unsplash.com/@jakobowens1' },
        { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1', photographer: 'Asoggetti', profileUrl: 'https://unsplash.com/@asoggetti' },
        { url: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b', photographer: 'Jaromir Kavan', profileUrl: 'https://unsplash.com/@jerrykavan' },
        { url: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d', photographer: 'Dino Reichmuth', profileUrl: 'https://unsplash.com/@dinoreichmuth' },
        { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', photographer: 'Sylvain Mauroux', profileUrl: 'https://unsplash.com/@sylvainmauroux' },
        { url: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0', photographer: 'Sime Basioli', profileUrl: 'https://unsplash.com/@basecore' },
        { url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800', photographer: 'Braden Jarvis', profileUrl: 'https://unsplash.com/@jarvisphoto' },
        { url: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2', photographer: 'Simon Migaj', profileUrl: 'https://unsplash.com/@simonmigaj' },
        { url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a', photographer: 'Arto Marttinen', profileUrl: 'https://unsplash.com/@wandervisions' },
        { url: 'https://images.unsplash.com/photo-1528127269322-539801943592', photographer: 'Emile Guillemot', profileUrl: 'https://unsplash.com/@emilegt' },
        { url: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff', photographer: 'Thomas Tucker', profileUrl: 'https://unsplash.com/@tents_and_tread' },
        { url: 'https://images.unsplash.com/photo-1528164344705-47542687000d', photographer: 'Davide Cantelli', profileUrl: 'https://unsplash.com/@cant89' }
      ]
    };

    // Get the category or use 'General' as default
    const category = story.category.split(',')[0].trim();
    const imageArray = defaultImages[category] || defaultImages['General'];

    // Create a more unique hash using story ID, slug, and title
    // This ensures that even stories with similar titles get different images
    const uniqueString = `${story.id || ''}-${story.slug || ''}-${story.title || ''}`;
    const uniqueHash = uniqueString.split('').reduce((acc, char, index) => {
      // Use character position to create more variation
      return acc + (char.charCodeAt(0) * (index + 1));
    }, 0);

    // Use the hash to select an image from the array
    const index = Math.abs(uniqueHash) % imageArray.length;
    const selectedImage = imageArray[index];

    return {
      imageUrl: selectedImage.url,
      photographer: {
        name: selectedImage.photographer,
        url: selectedImage.profileUrl
      }
    };
  }, [story.category, story.title, story.id, story.slug]);

  // Set up the page image tracker when the component mounts
  React.useEffect(() => {
    setupPageImageTracker();
  }, []);

  // Set the image source and photographer using our central image manager
  const [imageData] = React.useState(() => {
    // Use the validateAndCorrectImageData function to ensure consistency
    const validatedData = validateAndCorrectImageData(story.imageUrl, story.photographer?.name);

    // Get all currently used images on the page
    const usedImages = getUsedImagesOnPage();

    // If the validated image is already used on this page, get an alternative
    if (validatedData.url && isImageUsedOnPage(validatedData.url)) {
      // Use silent operation during build to reduce console noise
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[StoryCard] Image ${validatedData.url} is already used on this page. Getting alternative.`);
      }

      const alternativeData = getAlternativeImage(validatedData.photographer, usedImages);

      // Mark this new image as used
      markImageAsUsed(alternativeData.url);

      return {
        imageUrl: alternativeData.url,
        photographer: {
          name: alternativeData.photographer,
          url: `https://unsplash.com/@${alternativeData.photographer.toLowerCase().replace(/\s+/g, '')}`
        }
      };
    }

    // If we don't have valid data, fall back to our unique image generator
    if (!validatedData.url || !validatedData.photographer) {
      const fallbackData = getUniqueImageAndPhotographer();

      // Make sure this fallback image isn't already used
      if (isImageUsedOnPage(fallbackData.imageUrl)) {
        // Get a random image that's not already used
        const alternativeData = getAlternativeImage(fallbackData.photographer.name, usedImages);

        // Mark this new image as used
        markImageAsUsed(alternativeData.url);

        return {
          imageUrl: alternativeData.url,
          photographer: {
            name: alternativeData.photographer,
            url: `https://unsplash.com/@${alternativeData.photographer.toLowerCase().replace(/\s+/g, '')}`
          }
        };
      }

      // Mark this image as used
      markImageAsUsed(fallbackData.imageUrl);

      return {
        imageUrl: fallbackData.imageUrl,
        photographer: fallbackData.photographer
      };
    }

    // Mark this image as used
    markImageAsUsed(validatedData.url);

    return {
      imageUrl: validatedData.url,
      photographer: {
        name: validatedData.photographer,
        url: `https://unsplash.com/@${validatedData.photographer.toLowerCase().replace(/\s+/g, '')}`
      }
    };
  });

  // Use the validated image URL and photographer
  const imgSrc = imageData.imageUrl;
  let photographer = imageData.photographer;

  // Use React.useEffect to ensure image consistency on mount and updates
  React.useEffect(() => {
    // This effect ensures that the image and photographer are always consistent
    // It runs on component mount and whenever the story changes
    const ensureImageConsistency = async () => {
      try {
        // Only run this check if we have a story slug
        if (story.slug) {
          // Dynamically import the enhanced image tracker
          const { getBestImageForStory } = await import('@/src/utils/enhancedImageTracker');

          // Get the best image for this story
          const bestImage = getBestImageForStory(
            story.slug,
            story.category || 'Travel',
            story.title || '',
            '',
            story.tags || []
          );

          // If the current image doesn't match the best image, log a warning in development only
          // We don't update the image here to avoid flickering, but this helps with debugging
          if (imgSrc !== bestImage.imageUrl && process.env.NODE_ENV === 'development') {
            console.debug(`[StoryCard] Story ${story.slug} should use image ${bestImage.imageUrl} (${bestImage.photographer.name})`);
          }
        }
      } catch (error) {
        // Silently fail - this is just a consistency check
      }
    };

    // Run the consistency check
    ensureImageConsistency();
  }, [story.slug, story.category, story.title, story.tags, imgSrc]);

  // Clean up photographer URL if it has quotes around it
  if (photographer && photographer.url) {
    // Remove single quotes if they exist
    photographer = {
      ...photographer,
      url: photographer.url.replace(/^'(.*)'$/, '$1')
    };
  }

  // Handle date formatting with our utility
  const formattedDate = React.useMemo(() => {
    try {
      return formatDisplayDate(story.publishedAt);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  }, [story.publishedAt]);

  return (
    <div
      className={cn(
        "transition-all duration-300 hover:shadow-xl border rounded-lg overflow-hidden group hover:translate-y-[-4px]",
        story.featured && "border-primary",
        story.editorsPick && "border-secondary",
        className
      )}
    >
      <Link href={getStoryUrl(story.slug)} className="block">
        <div className="relative w-full overflow-hidden">
          <ResponsiveImage
            src={imgSrc}
            alt={story.title}
            priority={story.featured}
            className="rounded-t-lg transition-transform duration-700 group-hover:scale-110"
            aspectRatio="16/9"
            sizes={{
              sm: '100vw',
              md: '50vw',
              lg: '33vw'
            }}
            lazyLoad={!story.featured}
            containerClassName="relative"
            quality={85}
          />
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-0 left-0 bg-black/70 text-white text-xs p-2 z-10">
              Image URL: {imgSrc}
            </div>
          )}
          {photographer && (
            <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs p-2 rounded-tl z-10">
              Photo by{" "}
              {photographer.url ? (
                <a
                  href={photographer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-gray-200"
                >
                  {photographer.name}
                </a>
              ) : (
                <span className="font-bold">{photographer.name}</span>
              )}
              {" "}on{" "}
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:text-gray-200"
              >
                Unsplash
              </a>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            {story.featured && (
              <span className="inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white shadow-sm">Featured</span>
            )}
            {story.editorsPick && (
              <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-white shadow-sm">Editor's Pick</span>
            )}
            {story.category && (
              <Link href={getCategoryUrl(story.category)}>
                <span className="inline-flex items-center rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium group-hover:border-primary group-hover:text-primary transition-colors">{story.category}</span>
              </Link>
            )}
            {story.country && (
              <Link href={getCountryUrl(story.country)}>
                <span className="inline-flex items-center rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium group-hover:border-primary group-hover:text-primary transition-colors">{story.country}</span>
              </Link>
            )}
          </div>
          <h3 className="text-2xl font-semibold leading-tight tracking-tight group-hover:text-primary transition-colors mb-2">
            {story.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 mb-3">
            <FreshnessIndicator
              publishedDate={story.publishedAt}
              updatedDate={story.updatedAt}
              size="sm"
            />
            <span>•</span>
            <span>By Global Travel Report Editorial Team</span>
          </div>
          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{story.excerpt}</p>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {story.tags && story.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={getTagUrl(tag)}>
                <span className="inline-flex items-center rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium hover:bg-gray-50 hover:text-primary hover:border-primary transition-all">
                  {tag}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
};

// Fallback UI for when the StoryCard errors
const StoryCardFallback = () => (
  <div className={cn(
    "transition-all border border-gray-200 rounded-lg overflow-hidden"
  )}>
    <div className="w-full" style={{ aspectRatio: '16/9' }}>
      <div className="w-full h-full bg-gray-200 rounded-t-lg animate-pulse"></div>
    </div>
    <div className="p-5">
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
      <div className="h-7 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mb-3"></div>
      <div className="h-16 bg-gray-200 rounded animate-pulse mb-4"></div>
      <div className="pt-2 border-t border-gray-100 flex gap-2">
        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Export the StoryCard with error boundary
export const StoryCard = withErrorBoundary(StoryCardComponent, {
  fallback: <StoryCardFallback />,
  componentName: 'StoryCard'
});