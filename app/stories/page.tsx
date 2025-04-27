import { StorySearch } from "@/components/stories/StorySearch";
import type { Story } from "@/lib/stories";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Stories - Global Travel Report",
  description: "Explore amazing travel stories and experiences from around the world. Filter by country, category, and more.",
  openGraph: {
    title: "Travel Stories - Global Travel Report",
    description: "Explore amazing travel stories and experiences from around the world. Filter by country, category, and more.",
    type: "website",
    locale: "en_US",
    siteName: "Global Travel Report",
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel Stories - Global Travel Report",
    description: "Explore amazing travel stories and experiences from around the world. Filter by country, category, and more.",
  },
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
    },
  ];
};

export default async function StoriesPage() {
  const stories = await getStories();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Travel Stories</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore amazing travel experiences shared by our community of global travelers.
        </p>
      </div>

      <StorySearch stories={stories} />
    </div>
  );
} 