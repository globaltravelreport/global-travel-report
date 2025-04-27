import { Metadata } from 'next'
import { getAllStories } from '../lib/stories'
import StoryCard from '../components/stories/StoryCard'
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Global Travel Report - Your Guide to World Travel',
  description: 'Discover amazing destinations, travel tips, and cultural insights from around the world. Stay informed with the latest travel news and guides.',
  openGraph: {
    title: 'Global Travel Report - Your Guide to World Travel',
    description: 'Discover amazing destinations, travel tips, and cultural insights from around the world.',
    images: ['/images/og-image.jpg'],
    type: 'website',
  },
}

// This would typically come from an API or database
const featuredStories = [
  {
    id: "1",
    title: "Exploring the Hidden Temples of Kyoto",
    excerpt: "A journey through ancient Japanese architecture and culture...",
    author: "Sarah Johnson",
    date: "2024-03-15",
    location: "Kyoto, Japan",
    imageUrl: "/images/kyoto-temple.jpg",
  },
  {
    id: "2",
    title: "Safari Adventure in Tanzania",
    excerpt: "Witnessing the great migration in the Serengeti...",
    author: "Michael Chen",
    date: "2024-03-10",
    location: "Serengeti, Tanzania",
    imageUrl: "/images/serengeti-safari.jpg",
  },
  {
    id: "3",
    title: "Culinary Tour of Italy",
    excerpt: "From pasta in Rome to pizza in Naples...",
    author: "Emma Rodriguez",
    date: "2024-03-05",
    location: "Italy",
    imageUrl: "/images/italy-food.jpg",
  },
];

export default async function HomePage() {
  const stories = await getAllStories()
  const featuredStory = stories[0]
  const otherStories = stories.slice(1)

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Discover Amazing Travel Stories</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Share your adventures and explore stories from travelers around the world.
        </p>
        <Button asChild size="lg" className="mt-4">
          <Link href="/submit">Share Your Story</Link>
        </Button>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Featured Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      <section className="text-center">
        <Button asChild variant="outline">
          <Link href="/stories">View All Stories</Link>
        </Button>
      </section>

      {/* Newsletter Section */}
      <section className="bg-blue-50 my-12 py-12 rounded-2xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Stay Updated with Travel News
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
            Get the latest travel stories, guides, and insights delivered directly to your inbox.
          </p>
          <form className="mt-8 flex max-w-md mx-auto gap-x-4">
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Enter your email"
            />
            <button
              type="submit"
              className="flex-none rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
} 