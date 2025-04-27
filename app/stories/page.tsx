import { StoryCard } from "@/components/stories/StoryCard";
import type { Story } from "@/app/types/story";

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
      date: "2024-03-15",
      location: "Kyoto, Japan",
      imageUrl: "/images/kyoto-temple.jpg",
      publishedAt: "2024-03-15",
    },
    {
      id: "2",
      slug: "safari-adventure",
      title: "Safari Adventure in Tanzania",
      excerpt: "Witnessing the great migration in the Serengeti...",
      content: "Full content here...",
      author: "Michael Chen",
      date: "2024-03-10",
      location: "Serengeti, Tanzania",
      imageUrl: "/images/serengeti-safari.jpg",
      publishedAt: "2024-03-10",
    },
    {
      id: "3",
      slug: "italian-cuisine",
      title: "Culinary Tour of Italy",
      excerpt: "From pasta in Rome to pizza in Naples...",
      content: "Full content here...",
      author: "Emma Rodriguez",
      date: "2024-03-05",
      location: "Italy",
      imageUrl: "/images/italy-food.jpg",
      publishedAt: "2024-03-05",
    },
  ];
};

export const metadata = {
  title: "Travel Stories - Global Travel Report",
  description: "Discover amazing travel stories from around the world",
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
} 