import { notFound } from "next/navigation";
import Image from 'next/image';
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";
import { AdSenseInArticle, AdSenseLeaderboard } from '@/components/ads/AdSense';
import type { Metadata } from "next";
import { format } from 'date-fns';
import { getSafeDateString, validateDate } from '@/utils/date-utils';
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import DOMPurify from 'isomorphic-dompurify';
import { RelatedStories } from "@/components/recommendations/RelatedStories";
import { CategoryStories } from "@/components/recommendations/CategoryStories";
import { getStoryBySlug } from "@/utils/stories";
import { Toaster } from 'sonner';
import { generateStoryMeta } from "@/utils/meta";
import { StoryShareSection } from "@/components/stories/StoryShareSection";
import { StructuredData } from "@/components/seo/StructuredData";
import { generateAllEnhancedSchemas } from "@/utils/enhancedSchemaGenerator";
import { ContextualAffiliateRecommendations } from "@/components/affiliates/ContextualAffiliateRecommendations";
import { generateFacebookMeta } from "@/utils/facebook-optimizer";
import InterlineSponsorPlacement from "@/components/sponsorship/InterlineSponsorPlacement";

import PopularTags from "@/src/components/ui/PopularTags";
import { SupabaseStoryStore } from '@/src/services/supabaseStoryStore';

// Define the params type for Next.js
type StoryParams = {
  slug: string;
};

// Set revalidation time to ensure content is fresh
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: Promise<StoryParams> }): Promise<Metadata> {
  const { slug } = await params;
  // Try to get the story by slug
  let story = await getStoryBySlug(slug);

  // If not found, try to get from mock stories as a fallback
  if (!story) {
    const { mockStories } = await import('@/src/mocks/stories');
    story = mockStories.find(s => s.slug === slug) || null;
  }

  if (!story) {
    return {
      title: 'Story Not Found',
      description: 'The requested story could not be found.',
    };
  }

  // Generate optimized meta title and description
  const { title, description } = generateStoryMeta(story);

  // Construct the canonical URL for this story
  const storyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'}/stories/${story.slug}`;

  // Generate Facebook-optimized metadata
  const facebookMeta = generateFacebookMeta({
    title,
    description,
    imageUrl: story.imageUrl,
    url: storyUrl,
    type: 'article',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'
  });

  const _optimizedImageUrl = story.imageUrl;
  const optimizedAltText = story.title;

  // Get the base site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com';

  const _baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com';

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: story.tags.join(', '),
    alternates: {
      canonical: storyUrl,
    },
    openGraph: {
      title: facebookMeta.title,
      description: facebookMeta.optimizedDescription,
      type: "article",
      publishedTime: getSafeDateString(story.publishedAt, false, true),
      modifiedTime: getSafeDateString(story.updatedAt || story.publishedAt, false, true),
      url: storyUrl,
      siteName: 'Global Travel Report',
      images: facebookMeta.image ? [
        {
          url: facebookMeta.image,
          width: 1200,
          height: 630,
          alt: optimizedAltText,
        },
      ] : [],
      tags: story.tags,
      locale: 'en_AU',
      countryName: story.country,
    },
    twitter: {
      card: "summary_large_image",
      title: facebookMeta.title,
      description: facebookMeta.optimizedDescription,
      images: facebookMeta.image ? [facebookMeta.image] : [],
      creator: "@globaltravelreport",
      site: "@globaltravelreport",
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
      'og:image:width': '1200',
      'og:image:height': '630',
      'article:published_time': getSafeDateString(story.publishedAt, false, true),
      'article:publisher': siteUrl,
      'article:section': story.category || 'General',
      'article:tag': story.tags.join(','),
      ...(story.country && story.country !== 'Global' ? {
        'geo.placename': story.country,
        'geo.region': story.country,
      } : {}),
    },
  };
}

export default async function StoryPage({ params }: { params: Promise<StoryParams> }) {
  try {
    const { slug } = await params;
    // Try to get the story by slug
    let story = await getStoryBySlug(slug);

    // If not found, try to get from mock stories as a fallback
    if (!story) {
      const { mockStories } = await import('@/src/mocks/stories');
      story = mockStories.find(s => s.slug === slug) || null;
    }

    if (!story) {
      notFound();
    }

        // Fetch related stories for 'Recommended for You' section
        let relatedStories: Awaited<ReturnType<typeof SupabaseStoryStore.getRelatedStories>> = [];
        try {
          if (SupabaseStoryStore.isConfigured()) {
            relatedStories = await SupabaseStoryStore.getRelatedStories({
              slug: story.slug,
              category: story.category,
              country: story.country,
            });
          }
        } catch (error) {
          // Related content is optional; never turn a readable article into an error shell.
          console.error('Related stories unavailable:', error);
        }

    // Construct the canonical URL for this story
    const storyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'}/stories/${story.slug}`;

    return (
      <div>

        {/* Add structured data for SEO */}
        <StructuredData
          data={generateAllEnhancedSchemas(story, process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com')}
          id="story-structured-data"
        />

        {/* Add BreadcrumbList structured data */}
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Stories",
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'}/stories`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": story.category,
                "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'}/categories/${story.category.toLowerCase().replace(/\s+/g, '-')}`
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": story.title,
                "item": storyUrl
              }
            ]
          }}
          id="breadcrumb-structured-data"
        />

        <article className="max-w-4xl mx-auto px-4 py-8">
          <Toaster position="top-right" />

          {/* Add visual breadcrumb navigation */}
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: 'Stories', href: '/stories' },
                { label: story.category, href: `/categories/${story.category.toLowerCase().replace(/\s+/g, '-')}` },
                { label: story.title, active: true }
              ]}
              className="text-sm"
            />
          </div>

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
                <div className="flex flex-col space-y-1">
                  <div>
                    <span className="font-medium">By: </span>
                    <span>{story.author || 'Global Travel Report Editorial Desk'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Published: </span>
                    <span>{format(validateDate(story.date || story.publishedAt, true), 'MMMM dd, yyyy')}</span>
                  </div>
                  {story.updatedAt && new Date(story.updatedAt).getTime() !== new Date(story.publishedAt).getTime() && (
                    <div>
                      <span className="font-medium text-orange-600">Last updated: </span>
                      <span className="text-orange-600">{format(validateDate(story.updatedAt, true), 'MMMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {story.imageUrl && (
              <div className="relative w-full mb-8">
                <ResponsiveImage
                  src={story.imageUrl}
                  alt={story.title}
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

            <div className="not-prose mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <p className="font-semibold text-[#19273A]">Editorial note</p>
              <p className="mt-1">
                Published by the Global Travel Report Editorial Desk. Source material is reviewed, rewritten for Australian travellers, and checked for factual caution before publication.
              </p>
              {story.sourceUrl && (
                <p className="mt-2">
                  Source:{' '}
                  <a
                    href={story.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#8A6A20] underline"
                  >
                    {story.source || 'Original reporting'}
                  </a>
                </p>
              )}
              <p className="mt-2 text-xs text-gray-600">
                We distinguish original source material from our editorial context and update stories when material facts change.
              </p>
            </div>

            <InterlineSponsorPlacement className="not-prose mb-8" />

            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  story.content
                    .replace(/^\s*\|-\s*\n/m, '')
                    .replace(/^Content:\s*/i, '')
                    .replace(/Metadata in JSON format:[\s\S]*$/, '')
                    .replace(/\s*JSON\s*$/i, '')
                    .replace(/\n---\n[\s\S]*$/, '')
                )
              }}
            />

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

            <StoryShareSection
              story={story}
              className="mb-8"
              showRssFeed={true}
              showCopyLink={true}
              showFloatingButton={true}
            />
          </footer>

          {story.country !== 'Australia' && story.country !== 'Global' && (
            <div className="my-8 rounded-xl border border-[#C9A14A]/30 bg-[#F8F5EC] p-6">
              <h3 className="text-xl font-bold mb-2">Travelling to {story.country}?</h3>
              <p className="mb-4">
                Review official travel advice, entry requirements and digital security before you go.
              </p>
              <ContextualAffiliateRecommendations
                story={{...story, tags: [...story.tags, 'Security', 'VPN']}}
                variant="banner"
                title=""
                limit={1}
              />
            </div>
          )}

          <div className="my-8">
            <AdSenseLeaderboard />
          </div>

          {/* Related and category stories with popular tags sidebar */}
          <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <RelatedStories currentStory={story} limit={4} />
              <CategoryStories category={story.category} excludeStoryId={story.id} limit={4} />
            </div>

            <aside aria-label="Popular tags and topics" className="order-first md:order-none">
              <PopularTags className="md:sticky md:top-24" variant="default" showCounts={false} />
            </aside>
          </section>

          {/* Recommended for You */}
          {relatedStories.length > 0 && (
            <section className="mt-12 lg:mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedStories.map((rec) => (
                  <a
                    key={rec.slug}
                    href={`/stories/${rec.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {rec.imageUrl && (
                      <Image
                        src={rec.imageUrl}
                        alt={rec.imageAlt || rec.title}
                        width={480}
                        height={320}
                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    <div className="p-4">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#8A6A20]">
                        {rec.category}
                      </span>
                      <h3 className="mt-1 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-[#8A6A20]">
                        {rec.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{rec.excerpt}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Newsletter signup */}
          <div className="mt-12">
            <NewsletterSignup
              title="Get the Global Travel Report briefing"
              description="Travel news, practical planning context and selected sponsor offers delivered to your inbox."
            />
          </div>
        </article>
      </div>
    );
  } catch (_error) {
    console.error(_error);
    throw _error;
  }
}
