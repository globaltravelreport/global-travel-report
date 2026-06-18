import Image from 'next/image';
import { Story } from '../../../types/Story';

type HeroProps = {
  stories: Story[];
};

function getFeaturedStory(stories: Story[]): Story | null {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentStories = stories.filter((story) => {
    const storyDate = new Date(story.publishedAt || '');
    return !Number.isNaN(storyDate.getTime()) && storyDate >= thirtyDaysAgo;
  });

  const sortedStories = [...stories].sort((a, b) => {
    const dateA = new Date(a.publishedAt || '').getTime();
    const dateB = new Date(b.publishedAt || '').getTime();
    return (Number.isNaN(dateB) ? 0 : dateB) - (Number.isNaN(dateA) ? 0 : dateA);
  });

  return recentStories.find((story) => story.featured) ||
    recentStories[0] ||
    sortedStories.find((story) => story.featured) ||
    sortedStories[0] ||
    null;
}

function formatStoryDate(date: Story['publishedAt']): string | null {
  const parsedDate = new Date(date || '');

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function Hero({ stories }: HeroProps) {
  const featuredStory = getFeaturedStory(stories);
  const publishedDate = featuredStory ? formatStoryDate(featuredStory.publishedAt) : null;

  if (!featuredStory) {
    return (
      <div className="relative h-[600px] bg-gradient-to-b from-gray-100 to-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-600 mb-4">
              Global Travel Report
            </h1>
            <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
              Your destination for inspiring travel stories, tips, and guides from around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <a
                href="/destinations"
                className="bg-gradient-to-r from-[#C9A14A] to-[#B08D3F] hover:from-[#D5B05C] hover:to-[#C9A14A] text-white font-bold py-4 px-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                Explore Destinations
              </a>
              <a
                href="/categories"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-gray-700 border border-gray-300 font-bold py-4 px-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                Browse Categories
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-[520px] overflow-hidden bg-[#19273A] md:min-h-[600px]">
      {/* Background Image — pointer-events-none so this layer never intercepts header clicks */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={featuredStory.imageUrl || '/images/hero-rewrite.jpg'}
          alt={featuredStory.title}
          fill
          className="object-cover"
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#19273A]/95 via-[#19273A]/75 to-[#19273A]/25 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#F7F4ED] to-transparent pointer-events-none" />
        {featuredStory.photographer && featuredStory.photographer.name && (
          <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded pointer-events-auto">
            Photo by{" "}
            {featuredStory.photographer.url ? (
              <a
                href={featuredStory.photographer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-200"
              >
                {featuredStory.photographer.name}
              </a>
            ) : (
              <span>{featuredStory.photographer.name}</span>
            )}
            {" "}on{" "}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-200"
            >
              Unsplash
            </a>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-12 sm:px-6 md:min-h-[600px] lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center border-l-4 border-[#C9A14A] bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#F2D891] backdrop-blur-sm">
              Lead Story
            </span>
            {featuredStory.category && (
              <span className="text-sm font-medium text-white/80">
                {featuredStory.category}
              </span>
            )}
            {publishedDate && (
              <time className="text-sm text-white/65" dateTime={new Date(featuredStory.publishedAt).toISOString()}>
                {publishedDate}
              </time>
            )}
          </div>
          <h1 className="mb-5 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            {featuredStory.title}
          </h1>
          <p className="mb-8 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
            {featuredStory.excerpt}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`/stories/${featuredStory.slug}`}
              className="inline-flex items-center justify-center rounded-md border border-[#C9A14A] bg-[#C9A14A] px-6 py-3 text-base font-semibold text-[#19273A] shadow-lg transition-colors hover:bg-[#D8B75C] focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2 focus:ring-offset-[#19273A]"
            >
              Read Lead Story
            </a>
            <a
              href="/stories"
              className="inline-flex items-center justify-center rounded-md border border-white/70 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-[#19273A] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#19273A]"
            >
              Latest Stories
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
