import { Metadata } from 'next'
import { getAllStories } from '../lib/stories'
import StoryCard from '../components/stories/StoryCard'

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

export default async function HomePage() {
  const stories = await getAllStories()
  const featuredStory = stories[0]
  const otherStories = stories.slice(1)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="py-12 sm:py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Explore the World with</span>
            <span className="block text-blue-600">Global Travel Report</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            Your trusted source for travel inspiration, destination guides, and cultural insights from around the globe.
          </p>
        </div>
      </section>

      {/* Featured Story */}
      {featuredStory && (
        <section className="mb-12">
          <h2 className="sr-only">Featured Story</h2>
          <div className="mx-auto max-w-3xl">
            <StoryCard story={featuredStory} priority />
          </div>
        </section>
      )}

      {/* Latest Stories Grid */}
      <section className="py-12">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">Latest Stories</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {otherStories.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
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