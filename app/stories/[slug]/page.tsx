import { notFound } from "next/navigation";
import { NewsletterSignup } from "@/src/components/ui/NewsletterSignup";
import type { Story } from "@/types/Story";
import type { Metadata } from "next";
import { format } from 'date-fns';
import { Badge } from "@/src/components/ui/badge";
import { StoryCoverImage } from "@/src/components/ui/OptimizedImage";
import DOMPurify from 'isomorphic-dompurify';
import SchemaOrg from "@/components/SchemaOrg";
import { RelatedStories } from "@/components/recommendations/RelatedStories";
import { CategoryStories } from "@/components/recommendations/CategoryStories";
import { getAllStories, getStoryBySlug } from "@/src/utils/stories";
import { ShareButtons } from "@/src/components/ui/ShareButtons";
import { FloatingShareButton } from "@/src/components/ui/FloatingShareButton";
import { Toaster } from 'sonner';

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

  const title = `${story.title} - Global Travel Report`;
  const description = story.excerpt;
  const ogImage = story.imageUrl
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/og?title=${encodeURIComponent(story.title)}&destination=${encodeURIComponent(story.country)}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: new Date(story.publishedAt).toISOString(),
      authors: ["Global Travel Report Editorial Team"],
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: story.title,
        },
      ] : [],
      tags: story.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/stories/${story.slug}`,
    },
  };
}

export default async function StoryPage({ params }: { params: StoryParams }) {
  // Try to get the story by slug
  let story = await getStoryBySlug(params.slug);

  // If not found, try to get from mock stories as a fallback
  if (!story) {
    const { mockStories } = await import('@/src/mocks/stories');
    story = mockStories.find(s => s.slug === params.slug) || null;
  }

  if (!story) {
    notFound();
  }

  return (
    <>
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Toast notifications for copy to clipboard */}
      <Toaster position="top-right" />

      {/* Floating share button for mobile */}
      <FloatingShareButton
        url={`/stories/${story.slug}`}
        title={story.title}
        description={story.excerpt}
      />

      {/* Add structured data for SEO */}
      <SchemaOrg story={story} siteUrl={process.env.NEXT_PUBLIC_SITE_URL} />

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
            <span>{format(new Date(story.publishedAt), 'MMMM dd, yyyy')}</span>
            <span className="mx-2">•</span>
            <span>By Global Travel Report Editorial Team</span>
          </div>

          {/* Share buttons */}
          <ShareButtons
            url={`/stories/${story.slug}`}
            title={story.title}
            description={story.excerpt}
          />
        </div>

        {story.imageUrl && (
          <div className="relative w-full h-[400px] mb-8">
            <StoryCoverImage
              src={story.imageUrl}
              alt={story.title}
              priority={true}
              className="rounded-lg"
              photographer={story.photographer || {
                name: story.imageCredit ? story.imageCredit.replace('Photo by ', '').replace(' on Unsplash', '') : 'Photographer',
                url: story.imageCreditUrl || 'https://unsplash.com'
              }}
              showAttribution={true}
            />
          </div>
        )}
      </header>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-muted-foreground mb-8">{story.excerpt}</p>
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(story.content) }} />
      </div>

      <footer className="mt-8 pt-8 border-t">
        <div className="flex flex-wrap gap-2 mb-6">
          {story.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Share section at the bottom */}
        <div className="flex flex-col items-center justify-center py-6 border-t border-b mb-8">
          <h3 className="text-lg font-medium mb-4">Share this story</h3>
          <ShareButtons
            url={`/stories/${story.slug}`}
            title={story.title}
            description={story.excerpt}
            iconSize={40}
          />
        </div>
      </footer>

      {/* Related stories based on content similarity */}
      <RelatedStories currentStory={story} limit={4} />

      {/* More stories from the same category */}
      <CategoryStories category={story.category} excludeStoryId={story.id} limit={4} />

      <div className="mt-12">
        <NewsletterSignup />
      </div>
    </article>
    </>
  );
}