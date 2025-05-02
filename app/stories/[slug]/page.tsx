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

// Define the params type for Next.js 15
type StoryParams = {
  slug: string;
};

// Set revalidation time to ensure content is fresh
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: StoryParams }): Promise<Metadata> {
  const story = await getStoryBySlug(params.slug);

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
  const story = await getStoryBySlug(params.slug);

  if (!story) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
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

        <div className="flex items-center text-muted-foreground mb-6">
          <span>{format(new Date(story.publishedAt), 'MMMM dd, yyyy')}</span>
          <span className="mx-2">•</span>
          <span>By Global Travel Report Editorial Team</span>
        </div>

        {story.imageUrl && (
          <div className="relative w-full h-[400px] mb-8">
            <StoryCoverImage
              src={story.imageUrl}
              alt={story.title}
              priority={true}
              className="rounded-lg"
              photographer={story.photographer}
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
        <div className="flex flex-wrap gap-2">
          {story.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
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
  );
}