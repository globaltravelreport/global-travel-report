import { notFound } from "next/navigation";
import { NewsletterSignup } from "@/src/components/ui/NewsletterSignup";
import { AdSenseInArticle, AdSenseLeaderboard } from '@/src/components/ads/AdSense';
import type { Story } from "@/types/Story";
import type { Metadata } from "next";
import { format } from 'date-fns';
import { Badge } from "@/src/components/ui/badge";
import { StoryCoverImage } from "@/src/components/ui/OptimizedImage";
import { ResponsiveImage } from "@/src/components/ui/ResponsiveImage";
import DOMPurify from 'isomorphic-dompurify';
import { RelatedStories } from "@/components/recommendations/RelatedStories";
import { CategoryStories } from "@/components/recommendations/CategoryStories";
import { getAllStories, getStoryBySlug } from "@/src/utils/stories";
import { ShareButtons } from "@/src/components/ui/ShareButtons";
import { FloatingShareButton } from "@/src/components/ui/FloatingShareButton";
import { Toaster } from 'sonner';
import { generateStoryMeta } from "@/src/utils/meta";
import { StoryShareSection } from "@/src/components/stories/StoryShareSection";
import { EnhancedSocialShare } from "@/src/components/social/EnhancedSocialShare";
import { FacebookMetaTags } from "@/src/components/social/FacebookMetaTags";
// Import our new SEO utilities
import { enhanceStoryForSEO } from "@/utils/seoEnhancer";
import { optimizeStoryImageForSeo } from "@/utils/imageSeoOptimizer";
import { generateAllEnhancedSchemas } from "@/utils/enhancedSchemaGenerator";
// Import our new StructuredData component
import StructuredData from "@/components/StructuredData";
// Import affiliate components
import { ContextualAffiliateRecommendations } from "@/src/components/affiliates/ContextualAffiliateRecommendations";
import { ContextualTuneOffers } from "@/src/components/affiliates/ContextualTuneOffers";

// Define the params type for Next.js 15
type StoryParams = {
  slug: string;
};

// Set revalidation time to ensure content is fresh
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: StoryParams }): Promise<Metadata> {
  // Try to get the story by slug
  let story = await getStoryBySlug(params.slug);

  // If not found, try to get from mock stories as a fallback
  if (!story) {
    const { mockStories } = await import('@/src/mocks/stories');
    story = mockStories.find(s => s.slug === params.slug) || null;
  }

  if (!story) {
    return {
      title: 'Story Not Found',
      description: 'The requested story could not be found.',
    };
  }

  // Enhance the story with optimized SEO metadata
  const enhancedStory = enhanceStoryForSEO(story);

  // Generate optimized meta title and description
  const { title, description } = generateStoryMeta(enhancedStory);

  // Optimize the story image for SEO
  const { imageUrl: optimizedImageUrl, altText: optimizedAltText } = optimizeStoryImageForSeo(enhancedStory);

  // Generate Open Graph image URL
  // Use the optimized image if available, otherwise use a static OG image
  const ogImage = optimizedImageUrl
    ? optimizedImageUrl.startsWith('http')
      ? optimizedImageUrl
      : `${process.env.NEXT_PUBLIC_SITE_URL}${optimizedImageUrl.startsWith('/') ? optimizedImageUrl : `/${optimizedImageUrl}`}`
    : `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-image.jpg`;

  // Construct the canonical URL for this story
  const storyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com'}/stories/${enhancedStory.slug}`;

  // Get the base site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';

  return {
    title,
    description,
    keywords: enhancedStory.tags.join(', '),
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: new Date(enhancedStory.publishedAt).toISOString(),
      authors: ["Global Travel Report Editorial Team"],
      url: storyUrl,
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: optimizedAltText,
        },
      ] : [],
      siteName: 'Global Travel Report',
      tags: enhancedStory.tags,
      locale: 'en_AU',
      countryName: enhancedStory.country,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
      creator: "@GTravelReport",
      site: "@GTravelReport",
    },
    alternates: {
      canonical: storyUrl,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'geo.placename': enhancedStory.country !== 'Global' ? enhancedStory.country : undefined,
      'geo.region': enhancedStory.country !== 'Global' ? enhancedStory.country : undefined,
      'og:image:width': '1200',
      'og:image:height': '630',
      'article:published_time': new Date(enhancedStory.publishedAt).toISOString(),
      'article:publisher': siteUrl,
      'article:author': 'Global Travel Report Editorial Team',
      'article:section': enhancedStory.category,
      'article:tag': enhancedStory.tags.join(','),
    },
  };
}

export default async function StoryPage({ params }: { params: StoryParams }) {
  try {
    console.log(`Attempting to fetch story with slug: ${params.slug}`);

    // Try to get the story by slug
    let story = await getStoryBySlug(params.slug);

    // If not found, try to get from mock stories as a fallback
    if (!story) {
      console.log(`Story not found in database, trying mock stories for slug: ${params.slug}`);
      const { mockStories } = await import('@/src/mocks/stories');
      story = mockStories.find(s => s.slug === params.slug) || null;
    }

    if (!story) {
      console.log(`Story not found for slug: ${params.slug}, returning 404`);
      notFound();
    }

    console.log(`Successfully loaded story: ${story.title}`);


  // Construct the canonical URL for this story
    const storyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'}/stories/${story.slug}`;

  return (
    <>
    {/* Add Facebook meta tags directly to the head */}
    <FacebookMetaTags
      appId={process.env.FACEBOOK_APP_ID || '1122233334445556'}
      url={storyUrl}
    />

    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Toast notifications for copy to clipboard */}
      <Toaster position="top-right" />

      {/* We'll use the enhanced StoryShareSection component instead of FloatingShareButton */}

      {/* Add enhanced structured data for SEO using our new component */}
      <StructuredData
        slug={story.slug}
        data={generateAllEnhancedSchemas(enhanceStoryForSEO(story), process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com')}
      />

      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {story.featured && (
            <Badge variant="default">Featured</Badge>
          )}
          {story.editorsPick && (
            <Badge variant="secondary">Editor's Pick</Badge>
          )}
          <Badge variant="outline">{story.category}</Badge>
          <Badge variant="outline">{story.country}</Badge>
        </div>

        <h1 className="text-4xl font-bold mb-4">{story.title}</h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-muted-foreground mb-6">
          <div className="mb-4 sm:mb-0">
            <span>{format(new Date(story.date || story.publishedAt), 'MMMM dd, yyyy')}</span>
            <span className="mx-2">•</span>
            <span>By Global Travel Report Editorial Team</span>
          </div>

          {/* Enhanced share buttons */}
          <div className="hidden sm:block">
            <EnhancedSocialShare
              url={`/stories/${story.slug}`}
              title={story.title}
              description={story.excerpt}
              imageUrl={story.imageUrl}
              showShareButton={true}
              showLabels={false}
              iconSize={20}
              platforms={['facebook', 'twitter', 'linkedin', 'whatsapp']}
              trackShares={true}
            />
          </div>
        </div>

        {story.imageUrl && (
          <div className="relative w-full mb-8">
            <ResponsiveImage
              src={story.imageUrl}
              alt={optimizeStoryImageForSeo(story).altText}
              priority={true}
              className="rounded-lg"
              aspectRatio="21/9"
              sizes={{
                sm: '100vw',
                md: '100vw',
                lg: '1200px'
              }}
              quality={90}
              objectFit="cover"
              lazyLoad={false}
            />
            {(story.photographer || story.imageCredit) && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs p-2 rounded-md z-10">
                Photo by{" "}
                {story.photographer?.url || story.imageCreditUrl ? (
                  <a
                    href={(story.photographer?.url || story.imageCreditUrl || 'https://unsplash.com').replace(/^'(.*)'$/, '$1')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline hover:text-gray-200"
                  >
                    {story.photographer?.name || (story.imageCredit ? story.imageCredit.replace('Photo by ', '').replace(' on Unsplash', '') : 'Photographer')}
                  </a>
                ) : (
                  <span className="font-bold">
                    {story.photographer?.name || (story.imageCredit ? story.imageCredit.replace('Photo by ', '').replace(' on Unsplash', '') : 'Photographer')}
                  </span>
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
          </div>
        )}
      </header>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-muted-foreground mb-8">{story.excerpt}</p>

        {/* Full content */}
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              story.content
                .replace(/^\s*\|-\s*\n/m, '')
                .replace(/^Content:\s*/i, '')
                .replace(/Metadata in JSON format:[\s\S]*$/, '')
                .replace(/\s*JSON\s*$/i, '') // Remove any "JSON" text at the end
                .replace(/\n---\n[\s\S]*$/, '') // Remove any separator and metadata
            )
          }}
        />

        {/* Contextual Affiliate Recommendations - Mid-content */}
        {story.category === 'Cruise' ? (
          <ContextualAffiliateRecommendations
            story={story}
            variant="banner"
            title="Recommended Cruise Deals"
          />
        ) : (
          <ContextualAffiliateRecommendations
            story={story}
            variant="inline"
            title="Travel Recommendations"
          />
        )}

        {/* TUNE Contextual Offers */}
        <ContextualTuneOffers
          story={story}
          variant="inline"
          title="Exclusive Travel Offers"
          limit={2}
        />

        {/* AdSense In-Article Ad */}
        <AdSenseInArticle />
      </div>

      <footer className="mt-8 pt-8 border-t">
        <div className="flex flex-wrap gap-2 mb-6">
          {story.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Enhanced share section at the bottom */}
        <StoryShareSection
          story={story}
          className="mb-8"
          showRssFeed={true}
          showCopyLink={true}
          showFloatingButton={true}
        />
      </footer>

      {/* Nord VPN Recommendation for International Travel */}
      {story.country !== 'Australia' && story.country !== 'Global' && (
        <div className="my-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
          <h3 className="text-xl font-bold mb-2">Traveling to {story.country}?</h3>
          <p className="mb-4">
            Protect your online privacy and security while traveling internationally with Nord VPN.
            Access your favorite websites and services from anywhere in the world.
          </p>
          <ContextualAffiliateRecommendations
            story={{...story, tags: [...story.tags, 'Security', 'VPN']}}
            variant="banner"
            title=""
            limit={1}
          />
        </div>
      )}

      {/* AdSense Leaderboard */}
      <div className="my-8">
        <AdSenseLeaderboard />
      </div>

      {/* Related stories based on content similarity */}
      <RelatedStories currentStory={story} limit={4} />

      {/* More stories from the same category */}
      <CategoryStories category={story.category} excludeStoryId={story.id} limit={4} />

      <div className="mt-12">
        <NewsletterSignup
          title="Get More Travel Stories Like This"
          description="Subscribe to our newsletter and receive the latest travel stories, tips, and inspiration directly to your inbox."
        />
      </div>
    </article>
    </>
  );
  } catch (error) {
    console.error('Error rendering story page:', error);
    throw error; // This will trigger the error.tsx component
  }
}