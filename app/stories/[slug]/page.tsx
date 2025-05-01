import { notFound } from "next/navigation";
import { RelatedStories } from "@/src/components/stories/RelatedStories";
import { NewsletterSignup } from "@/src/components/ui/NewsletterSignup";
import type { Story } from "@/types/Story";
import type { Metadata } from "next";
import { format } from 'date-fns';
import { Badge } from "@/src/components/ui/badge";
import { StoryCoverImage } from "@/src/components/ui/OptimizedImage";
import DOMPurify from 'isomorphic-dompurify';

// Define the params type for Next.js 15
type StoryParams = {
  slug: string;
};

// This would typically come from an API or database
const getStories = async (): Promise<Story[]> => {
  // Mock data for demonstration
  return [
    {
      id: "1",
      slug: "exploring-kyoto",
      title: "Exploring the Hidden Temples of Kyoto",
      excerpt: "A journey through ancient Japanese architecture and culture...",
      content: "Full content here...",
      author: "Sarah Johnson",
      category: "Culture",
      country: "Japan",
      tags: ["temples", "culture", "history"],
      featured: true,
      editorsPick: true,
      publishedAt: new Date("2024-03-15T00:00:00Z"),
      imageUrl: "/images/kyoto-temple.jpg",
      photographer: {
        name: "John Smith",
        url: "https://unsplash.com/@johnsmith"
      },
    },
    {
      id: "2",
      slug: "safari-adventure",
      title: "Safari Adventure in Tanzania",
      excerpt: "Witnessing the great migration in the Serengeti...",
      content: "Full content here...",
      author: "Michael Chen",
      category: "Adventure",
      country: "Tanzania",
      tags: ["wildlife", "safari", "nature"],
      featured: true,
      editorsPick: false,
      publishedAt: new Date("2024-03-10T00:00:00Z"),
      imageUrl: "/images/serengeti-safari.jpg",
      photographer: {
        name: "Jane Doe",
        url: "https://unsplash.com/@janedoe"
      },
    },
    {
      id: "3",
      slug: "culinary-tour-italy",
      title: "Culinary Tour of Italy",
      excerpt: "From pasta in Rome to pizza in Naples...",
      content: "Full content here...",
      author: "Emma Rodriguez",
      category: "Food",
      country: "Italy",
      tags: ["food", "culture", "culinary"],
      featured: false,
      editorsPick: true,
      publishedAt: new Date("2024-03-05T00:00:00Z"),
      imageUrl: "/images/italy-food.jpg",
      photographer: {
        name: "Marco Rossi",
        url: "https://unsplash.com/@marcorossi"
      },
    },
  ];
};

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: StoryParams }): Promise<Metadata> {
  const stories = await getStories();
  const story = stories.find(s => s.slug === params.slug);

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
      authors: [story.author],
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
  const stories = await getStories();
  const story = stories.find(s => s.slug === params.slug);

  if (!story) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
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
          <span>By {story.author}</span>
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

      <RelatedStories currentStory={story} allStories={stories} />

      <div className="mt-12">
        <NewsletterSignup />
      </div>
    </article>
  );
}