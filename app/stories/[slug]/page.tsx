import Image from "next/image";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { RelatedStories } from "@/components/stories/RelatedStories";
import { SocialShare } from "@/components/ui/SocialShare";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";
import { formatDate } from "@/lib/stories";
import type { Story } from "@/lib/stories";
import type { Metadata } from "next";

// This would typically come from an API or database
const getStory = async (slug: string): Promise<Story | null> => {
  // Mock data for demonstration
  const stories: Record<string, Story> = {
    "exploring-kyoto": {
      id: "1",
      slug: "exploring-kyoto",
      title: "Exploring the Hidden Temples of Kyoto",
      excerpt: "A journey through ancient Japanese architecture and culture...",
      content: `
        <p>Kyoto, the former imperial capital of Japan, is a city where ancient traditions seamlessly blend with modern life. During my recent visit, I had the privilege of exploring some of the city's most remarkable temples, each telling its own unique story of Japan's rich cultural heritage.</p>
        
        <h2>The Golden Pavilion (Kinkaku-ji)</h2>
        <p>My journey began at the iconic Kinkaku-ji, also known as the Golden Pavilion. This Zen temple's top two floors are completely covered in gold leaf, creating a stunning reflection in the surrounding pond. The sight of the pavilion shimmering in the early morning light was truly breathtaking.</p>
        
        <h2>Fushimi Inari Shrine</h2>
        <p>Next, I ventured to the famous Fushimi Inari Shrine, known for its thousands of vermillion torii gates winding up Mount Inari. The hike through the torii tunnel was a meditative experience, with each step revealing new perspectives of this architectural marvel.</p>
        
        <h2>Hidden Gems</h2>
        <p>While the famous temples are undoubtedly impressive, some of my most memorable experiences came from discovering smaller, lesser-known temples tucked away in quiet neighborhoods. These hidden gems offered a more intimate glimpse into Kyoto's spiritual life.</p>
        
        <h2>Preserving Tradition</h2>
        <p>What struck me most was how Kyoto has managed to preserve its cultural heritage while embracing modernity. The city serves as a living museum, where centuries-old traditions continue to thrive in the 21st century.</p>
      `,
      author: "Sarah Johnson",
      category: "Culture",
      country: "Japan",
      tags: ["temples", "culture", "history"],
      featured: true,
      editorsPick: true,
      publishedAt: new Date("2024-03-15T00:00:00Z"),
      imageUrl: "/images/kyoto-temple.jpg",
      photographer: {
        name: "Hiroshi Tanaka",
        url: "https://unsplash.com/@hiroshi"
      }
    },
  };

  return stories[slug] || null;
};

const getAllStories = async (): Promise<Story[]> => {
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
        name: "John Doe",
        url: "https://unsplash.com/@johndoe",
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
        name: "Jane Smith",
        url: "https://unsplash.com/@janesmith",
      },
    },
  ];
};

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const story = await getStory(params.slug);
  if (!story) return {};

  const title = `${story.title} | ${story.country} | Global Travel Report`;
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
      publishedTime: story.publishedAt.toISOString(),
      authors: [story.author],
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: story.title,
        },
      ] : [],
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

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const story = await getStory(params.slug);
  const allStories = await getAllStories();

  if (!story) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="relative aspect-video w-full mb-6">
          <Image
            src={story.imageUrl || '/images/placeholder.svg'}
            alt={story.title}
            fill
            className="object-cover rounded-lg"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder.svg';
            }}
          />
        </div>

        <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
        
        <div className="flex items-center justify-between text-gray-600 mb-8">
          <div>
            <p className="font-medium">{story.author}</p>
            <p>{story.country}</p>
          </div>
          <time dateTime={story.publishedAt.toISOString()}>
            {formatDate(story.publishedAt)}
          </time>
        </div>

        <SocialShare 
          url={`${process.env.NEXT_PUBLIC_SITE_URL}/stories/${story.slug}`}
          title={story.title}
          className="mb-8"
        />
      </div>

      <Card className="p-8 mb-12">
        <div className="prose prose-lg max-w-none">
          {story.content.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      </Card>

      <RelatedStories currentStory={story} allStories={allStories} />

      <div className="mt-12">
        <NewsletterSignup />
      </div>
    </article>
  );
} 